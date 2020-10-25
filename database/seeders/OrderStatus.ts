import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import OrderStatus from 'App/Models/OrderStatus'
import { PaymentStatusCodes } from 'App/utils/PaymentStatusCodes'

export default class OrderStatusSeeder extends BaseSeeder {
  public async run () {
    const statusCodesToCreate = Object.values(PaymentStatusCodes).map(statusCode => {
      return { statusCode: statusCode}
    })

    await OrderStatus.createMany(statusCodesToCreate)
  }
}
