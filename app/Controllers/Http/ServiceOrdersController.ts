import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import OrderedProduct from 'App/Models/OrderedProduct'
import OrderStatus from 'App/Models/OrderStatus'
import Product from 'App/Models/Product'
import ServiceOrder from 'App/Models/ServiceOrder'
import Wallet from 'App/Models/Wallet'

export default class ServiceOrdersController {
  public async index () {
    return await ServiceOrder.query().preload('orderStatus').preload('orderedProducts')
  }

  public async store ({ request, response }: HttpContextContract) {
    // define schema for the request params and validate
    const serviceOrderSchema = schema.create({
      products: schema.array().members(schema.object().members({
        product_id: schema.number(),
        qty: schema.number(),
      })),
    })

    const validatedData = await request.validate({schema: serviceOrderSchema})

    const errorTypeTrack = {
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
      serviceOrder.useTransaction(trx)

      const serviceOrderSaved = await serviceOrder.save()

      // calculate and create orderedProducts
      let totalValue = 0
      await Promise.all(validatedData.products.map(async orderedProductData => {
        const product = await Product.findBy('id', orderedProductData.product_id)
        if (!product) {
          errorTypeTrack.status = 400
          errorTypeTrack.message = `id in product with id ${orderedProductData.product_id}`
          throw new Error('')
        }
        // increment totalvalue by the price times quantity
        totalValue += product.price * orderedProductData.qty

        // remove from stock
        if (product.stock_qty < orderedProductData.qty) {
          errorTypeTrack.status = 400
          errorTypeTrack.message = `qty in product with id ${orderedProductData.product_id}`
          throw new Error('')
        }

        product.stock_qty -= orderedProductData.qty
        product.useTransaction(trx)

        await product.save()

        // generating orderedProducts
        const orderedProduct = new OrderedProduct()

        orderedProduct.serviceOrderId = serviceOrderSaved.id
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
      serviceOrderSaved.total_value = totalValue
      await serviceOrderSaved.save()

      const wallet = await Wallet.findBy('id', 1)

      if (!wallet) {
        errorTypeTrack.status = 400
        errorTypeTrack.message = 'wallet do not exist'
        throw new Error('')
      }

      if (wallet.money_qty < serviceOrderSaved.total_value) {
        errorTypeTrack.status = 400
        errorTypeTrack.message = 'insuficient money'
        throw new Error('')
      }

      wallet.money_qty -= serviceOrderSaved.total_value

      wallet.useTransaction(trx)

      await wallet.save()

      response.status(200).send(wallet)
    }).catch(() => {
      if (errorTypeTrack.status === 0) {
        return response.status(500)
      }
      return response.status(errorTypeTrack.status).json({message: errorTypeTrack.message})
    })
  }
}
