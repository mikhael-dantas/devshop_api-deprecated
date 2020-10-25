import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ServiceOrder from 'App/Models/ServiceOrder'

import Wallet from 'App/Models/Wallet'
import { ApiValidSchemas } from 'App/utils/ApiValidSchemas'
import PaymentStatusChangeHandler from 'App/utils/PaymentStatusChangeHandler'
import { PaymentStatusCodes } from 'App/utils/PaymentStatusCodes'

export default class WalletPaymentsController {
  public async store ({ request, response, auth }: HttpContextContract) {
    const loggedUser = auth.user
    if (!loggedUser) {
      return response.status(401)
    }

    const validatedData = await request.validate({schema: ApiValidSchemas.walletpayments.post})

    const wallet = await Wallet.findBy('user_id', loggedUser.id)

    if (!wallet) {
      throw new Error('')
    }

    const serviceOrder = await ServiceOrder.findBy('id', validatedData.service_order_id)

    if (!serviceOrder) {
      throw new Error('')
    }

    if (wallet.money_qty < serviceOrder.total_value) {
      throw new Error('')
    }

    wallet.money_qty -= serviceOrder.total_value

    if (await wallet.save()) {
      await PaymentStatusChangeHandler(validatedData.service_order_id, PaymentStatusCodes.complete)
      return response.status(200)
    } else {
      throw new Error('')
    }
  }
}
