import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ApiValidSchemas } from '../../utils/ApiValidSchemas'

import Database from '@ioc:Adonis/Lucid/Database'
import OrderedProduct from 'App/Models/OrderedProduct'
import OrderStatus from 'App/Models/OrderStatus'
import Product from 'App/Models/Product'
import ServiceOrder from 'App/Models/ServiceOrder'
import User from 'App/Models/User'
import { PaymentStatusCodes } from 'App/utils/PaymentStatusCodes'

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
    const productErrorSectionTrack: {
      id: number,
      field: string,
      message: string,
    }[] = []

    await Database.transaction(async (trx) => {
      const orderStatus = await OrderStatus.findBy('status_code', PaymentStatusCodes.pending)
      if (!orderStatus) {
        throw new Error('no pending order status finded')
      }
      // service order opening
      const serviceOrder = new ServiceOrder()
      serviceOrder.orderStatusId = orderStatus.id
      serviceOrder.userId = userId
      serviceOrder.useTransaction(trx)

      const savedServiceOrder = await serviceOrder.save()

      // calculate total value and create orderedProducts
      let totalValue = 0
      await Promise.all(validatedData.products.map(async orderedProductData => {
        const product = await Product.findBy('id', orderedProductData.product_id)
        if (!product) {
          productErrorSectionTrack.push({
            id: orderedProductData.product_id,
            field: 'id',
            message: 'product not finded',
          })
          throw new Error('')
        }
        // increment totalvalue by the price times quantity
        totalValue += product.price * orderedProductData.qty

        // remove from stock
        if (product.stock_qty < orderedProductData.qty) {
          productErrorSectionTrack.push({
            id: orderedProductData.product_id,
            field: 'qty',
            message: 'quantity unavailable',
          })
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

      // Closing serviceOrder and returning it
      savedServiceOrder.total_value = totalValue
      await savedServiceOrder.save()

      return savedServiceOrder
    }).catch((error) => {
      if (productErrorSectionTrack.length === 0) {
        throw error
      }
      return response.status(400).json({errors: productErrorSectionTrack})
    })
  }
}
