import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import Database from '@ioc:Adonis/Lucid/Database'
import Wallet from 'App/Models/Wallet'

export default class UserSeeder extends BaseSeeder {
  public async run () {
    await Database.transaction(async (trx) => {
      // creating user
      const user = new User()
      user.email = Env.get('MASTER_EMAIL') as string
      user.password = Env.get('MASTER_PASSWORD') as string
      user.is_master = true
      user.is_admin = true

      user.useTransaction(trx)
      const savedUser = await user.save()

      // creating wallet
      const wallet = new Wallet()
      wallet.money_qty = 100000
      wallet.userId = savedUser.id

      wallet.useTransaction(trx)
      await wallet.save()
    })
  }
}
