import Database from '@ioc:Adonis/Lucid/Database'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

import User from 'App/Models/User'
import Wallet from 'App/Models/Wallet'

export default class UsersController {
  public async index ({auth}: HttpContextContract) {
    const userId = auth.user?.id
    return await User.query().where({id: userId}).preload('wallet').preload('serviceOrder')
  }

  public async store ({ request, response, auth }: HttpContextContract) {
    const productsSchema = schema.create({
      email: schema.string(),
      password: schema.string(),
    })

    const validatedData = await request.validate({schema: productsSchema})

    const userFinded = await User.findBy('email', validatedData.email)
    if (userFinded) {
      return response.status(400).json({message: 'email already exists'})
    }

    await Database.transaction(async (trx) => {
      // creating user
      const user = new User()
      user.email = validatedData.email
      user.password = validatedData.password
      user.is_admin = false

      user.useTransaction(trx)
      const savedUser = await user.save()

      // creating wallet
      const wallet = new Wallet()
      wallet.money_qty = 10000
      wallet.userId = savedUser.id

      wallet.useTransaction(trx)
      await wallet.save()
    }).catch((error) => {
      return response.send(error.message)
    })

    const token = await auth.use('api').attempt(validatedData.email, validatedData.password, {
      expiresIn: '1 hour',
    })
    return token.toJSON()
  }
}
