import Database from '@ioc:Adonis/Lucid/Database'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from 'App/Models/User'
import Wallet from 'App/Models/Wallet'

export default class UsersController {
  public async index () {
    return await User.query().preload('wallet').preload('serviceOrder')
  }

  public async store ({ response }: HttpContextContract) {
    await Database.transaction(async (trx) => {
      const user = new User()
      user.key = 'kfjds'
      user.is_admin = false

      user.useTransaction(trx)
      const savedUser = await user.save()

      const wallet = new Wallet()
      wallet.money_qty = 10000
      wallet.userId = savedUser.id

      wallet.useTransaction(trx)
      await wallet.save()

      return savedUser
    }).catch(() => {
      return response.status(500).json({message: 'user creation failed'})
    })
  }
}
