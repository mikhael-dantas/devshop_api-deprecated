import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ApiValidSchemas } from '../../utils/ApiValidSchemas'

import Database from '@ioc:Adonis/Lucid/Database'
import OrderedProduct from 'App/Models/OrderedProduct'
import OrderStatus from 'App/Models/OrderStatus'
import Product from 'App/Models/Product'
import ServiceOrder from 'App/Models/ServiceOrder'
import User from 'App/Models/User'
import Wallet from 'App/Models/Wallet'

export default class ServiceOrdersController {
  private returnOrderString (order:any) {
    switch (order) {
      case 'asc':
        return 'asc'
      case 'desc':
        return 'desc'
      default:
        return 'asc'
    }
  }

  public async index ({request, response, auth}: HttpContextContract) {
    const user = await User.findBy('id', auth.user?.id)

    if (!user) {
      return response.status(401)
    }

    const validatedData = await request.validate({schema: ApiValidSchemas.serviceorders.get})

    // set default values and params
    if (!validatedData.page) {
      validatedData.page = 1
    }

    if (!validatedData.sort) {
      validatedData.sort = 'created_at'
      validatedData.order = 'desc'
    }

    const params = {
      userId: user.id,
    }
    if (validatedData.id) {
      params['id'] = validatedData.id
    }

    // query
    const productQuery = await ServiceOrder.query()
      .preload('orderStatus')
      .preload('orderedProducts')
      .where(params)
      .orderBy(validatedData.sort, this.returnOrderString(validatedData.order))
      .paginate(validatedData.page, validatedData.pagination)

    return productQuery
  }

  public async store ({ request, response, auth}: HttpContextContract) {
    const user = await User.findBy('id', auth.user?.id)
    if (!user) {
      return response.status(401)
    }

    const userId = user.id

    const validatedData = await request.validate({schema: ApiValidSchemas.serviceorders.post})

    // start order creation
    const errorSectionTrack = {
      status: 0,
      message: '',
    }

    await Database.transaction(async (trx) => {
      // create order status
      const orderStatus = new OrderStatus()
      orderStatus.statusCode = 0
      orderStatus.useTransaction(trx)

      const orderStatusSaved = await orderStatus.save()

      // service order opening
      const serviceOrder = new ServiceOrder()
      serviceOrder.orderStatusId = orderStatusSaved.id
      serviceOrder.userId = userId
      serviceOrder.useTransaction(trx)

      const savedServiceOrder = await serviceOrder.save()

      // calculate total value and create orderedProducts
      let totalValue = 0
      await Promise.all(validatedData.products.map(async orderedProductData => {
        const product = await Product.findBy('id', orderedProductData.product_id)
        if (!product) {
          errorSectionTrack.status = 400
          errorSectionTrack.message = `id in product with id ${orderedProductData.product_id}`
          throw new Error('')
        }
        // increment totalvalue by the price times quantity
        totalValue += product.price * orderedProductData.qty

        // remove from stock
        if (product.stock_qty < orderedProductData.qty) {
          errorSectionTrack.status = 400
          errorSectionTrack.message = `qty in product with id ${orderedProductData.product_id}`
          throw new Error('')
        }

        product.stock_qty -= orderedProductData.qty
        product.useTransaction(trx)

        await product.save()

        // generating orderedProducts
        const orderedProduct = new OrderedProduct()

        orderedProduct.serviceOrderId = savedServiceOrder.id
        orderedProduct.productId = orderedProductData.product_id
        orderedProduct.qty = orderedProductData.qty
        orderedProduct.product_name = product.name
        orderedProduct.product_description = product.description
        orderedProduct.purchased_price = product.price

        orderedProduct.useTransaction(trx)
        await orderedProduct.save()
        return orderedProduct
      }))

      // Closing serviceOrder
      savedServiceOrder.total_value = totalValue
      await savedServiceOrder.save()

      // process payment
      const wallet = await Wallet.findBy('user_id', userId)

      if (!wallet) {
        errorSectionTrack.status = 400
        errorSectionTrack.message = 'wallet do not exist'
        throw new Error('')
      }

      if (wallet.money_qty < savedServiceOrder.total_value) {
        errorSectionTrack.status = 400
        errorSectionTrack.message = 'insuficient money'
        throw new Error('')
      }

      wallet.money_qty -= savedServiceOrder.total_value

      wallet.useTransaction(trx)

      await wallet.save()

      orderStatusSaved.statusCode = 1

      orderStatusSaved.useTransaction(trx)
      await orderStatusSaved.save()

      response.status(200).send(savedServiceOrder)
    }).catch(() => {
      if (errorSectionTrack.status === 0) {
        return response.status(500)
      }
      return response.status(errorSectionTrack.status).json({message: errorSectionTrack.message})
    })
  }
}
