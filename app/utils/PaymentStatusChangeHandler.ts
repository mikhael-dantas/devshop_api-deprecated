import OrderStatus from 'App/Models/OrderStatus'
import ServiceOrder from 'App/models/ServiceOrder'
import { PaymentStatusCodes } from './PaymentStatusCodes'

export default async function PaymentStatusChangeHandler (serviceOrderId: number, statusCode: string) {
  const serviceOrder = await ServiceOrder.findBy('id', serviceOrderId)
  if (!serviceOrder) {
    throw new Error('')
  }

  const orderstatus = await OrderStatus.findBy('status_code', statusCode)
  if (!orderstatus) {
    throw new Error('')
  }

  switch (statusCode) {
    case PaymentStatusCodes.complete:

      break

    default:
      break
  }

  serviceOrder.orderStatusId = orderstatus.id

  return (await serviceOrder.save()).toJSON
}

// import Wallet from 'App/Models/Wallet'
// const wallet = await Wallet.findBy('user_id', serviceOrder.userId)

// if (!wallet) {
//   throw new Error('')
// }

// if (wallet.money_qty < serviceOrder.total_value) {
//   throw new Error('')
// }

// wallet.money_qty -= serviceOrder.total_value

// wallet.useTransaction(trx)

// await wallet.save()
