// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Wallet from 'App/Models/Wallet'

export default class WalletsController {
  public async index () {
    return await Wallet.query()
  }

  public async store () {
    const wallet = await Wallet.create({money_qty: 1000000})
    return wallet
  }
}
