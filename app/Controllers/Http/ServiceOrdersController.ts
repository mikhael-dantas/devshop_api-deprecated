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
    const serviceOrderSchema = schema.create({
      products: schema.array().members(schema.object().members({
        product_id: schema.number(),
        qty: schema.number(),
      })),
    })

    const validatedData = await request.validate({schema: serviceOrderSchema})

    await Database.transaction(async trx => {
      // create status
      const orderStatus = await OrderStatus.create({statusCode: 0}, trx)

      // create serviceOrder
      const serviceOrder = new ServiceOrder()
      serviceOrder.orderStatusId = orderStatus.id
      serviceOrder.useTransaction(trx)

      // sum of all values and create order
      let orderedProductsTotalValue = 0
      await Promise.all(validatedData.products.map(async orderedProduct => {
        const product = await Product.findBy('id', orderedProduct.product_id)
        if (!product) {
          throw new Error()
        }
        orderedProductsTotalValue = orderedProductsTotalValue + product.price * orderedProduct.qty

        // create orderedProducts
        const createdOrderedProduct = await OrderedProduct.create(
          {
            productId: orderedProduct.product_id,
            qty: orderedProduct.qty,
            serviceOrderId: serviceOrder.id,
          }, trx
        )

        return createdOrderedProduct
      }))

      serviceOrder.total_value = orderedProductsTotalValue

      await serviceOrder.save()

      try {
        trx.commit()
        return response.send(serviceOrder)
      } catch (error) {
        trx.rollback()
        return response.send(error)
      }
    })
  }
}
