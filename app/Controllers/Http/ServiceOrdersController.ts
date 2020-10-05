import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import OrderedProduct from 'App/Models/OrderedProduct'
import OrderStatus from 'App/Models/OrderStatus'
import Product from 'App/Models/Product'
import ServiceOrder from 'App/Models/ServiceOrder'

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
          throw new Error('')
        }
        // increment totalvalue by the price times quantity
        totalValue += product.price * orderedProductData.qty

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

      response.status(200).send(serviceOrderSaved)
    })
  }
}
