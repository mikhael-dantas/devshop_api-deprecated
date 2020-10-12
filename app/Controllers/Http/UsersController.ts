import Database from '@ioc:Adonis/Lucid/Database'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

import User from 'App/Models/User'
import Wallet from 'App/Models/Wallet'

export default class UsersController {
  public async index ({auth, request }: HttpContextContract) {
    const userId = auth.user?.id
    const {all} = request.only(['all'])
    const user = await User.query().where({id: userId}).preload('wallet').preload('serviceOrder')
    if (user[0].is_master && all) {
      return await User.query().where({'is_admin': true}).preload('serviceOrder')
    }
    return user
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
      wallet.money_qty = 60000
      wallet.userId = savedUser.id

      wallet.useTransaction(trx)
      await wallet.save()
    }).catch((error) => {
      return response.send(error.message)
    })

    const token = await auth.use('api').attempt(validatedData.email, validatedData.password, {
      expiresIn: '18 hours',
    })
    return token.toJSON()
  }

  public async update ({auth, request, response}: HttpContextContract) {
    const userId = auth.user?.id
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const {email, money_to_add, is_admin} = request.only(['email', 'is_admin', 'money_to_add'])
    try {
      const user = await User.findByOrFail('id', userId)
      if (!user.is_master) {
        throw new Error('')
      }

      // validations
      const userToUpdate = await User.findBy('email', email)

      if (!userToUpdate) {
        return response.status(400).json({message: 'This user do not exist'})
      }

      if (!money_to_add && !is_admin) {
        return response.status(400).send('no given instruction')
      }

      if (!email && typeof email !== 'string') {
        return response.status(400).send('email string required')
      }

      if (money_to_add && typeof money_to_add !== 'number') {
        return response.status(400).send('money_to_add must be a integer')
      }

      if (is_admin && typeof is_admin !== 'boolean') {
        return response.status(400).send('is_admin must be a boolean')
      }

      // execution
      if (money_to_add) {
        const wallet = await Wallet.findBy('userId', userToUpdate.id)
        if (!wallet) {
          return response.status(400).send('wallet find error')
        }
        wallet.money_qty += money_to_add
        return await wallet.save()
      }

      if (is_admin) {
        userToUpdate.is_admin = is_admin
      }

      await userToUpdate.save()
    } catch (error) {
      return response.status(500).json({message: 'permission denied'})
    }
  }
}
