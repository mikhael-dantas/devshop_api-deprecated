/* eslint-disable @typescript-eslint/naming-convention */
import Database from '@ioc:Adonis/Lucid/Database'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ApiValidSchemas } from '../../utils/ApiValidSchemas'

import User from 'App/Models/User'
import Wallet from 'App/Models/Wallet'

export default class UsersController {
  public async index ({auth, request }: HttpContextContract) {
    const validatedData = await request.validate({schema: ApiValidSchemas.users.get})

    const loggedUserId = auth.user?.id
    const loggedUser = await User.query().where({id: loggedUserId}).preload('wallet').preload('serviceOrder')

    // return array of users, all users if master requires
    // (option filter for master: admins: true), only logged user for not masters
    if (loggedUser[0].is_master && validatedData.all) {
      const params = {} as object

      if (validatedData.admins) {
        params['is_admin'] = true
      }

      return await User.query()
        .where(params)
        .preload('wallet')
        .preload('serviceOrder')
    } else {
      return loggedUser
    }
  }

  public async store ({ request, response, auth }: HttpContextContract) {
    const validatedData = await request.validate({schema: ApiValidSchemas.users.post})

    const userFinded = await User.findBy('email', validatedData.email)

    if (userFinded) {
      return response.status(400).json({
        errors: [
          {field: 'email'},
        ],
      })
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
    })

    // login for the created user
    const token = await auth.use('api').attempt(validatedData.email, validatedData.password, {
      expiresIn: '18 hours',
    })

    return token.toJSON()
  }

  public async update ({auth, request, response}: HttpContextContract) {
    const validatedData = await request.validate({schema: ApiValidSchemas.users.put})
    const {email, is_admin, money_to_add} = validatedData

    const loggedUserId = auth.user?.id

    const user = await User.findByOrFail('id', loggedUserId)
    if (!user.is_master) {
      return response.status(401)
    }

    // validations
    const userToUpdate = await User.findBy('email', email)

    if (!userToUpdate) {
      return response.status(400).json({
        errors: [
          {
            field: 'email',
            message: 'user not finded',
          },
        ],
      })
    }

    // execute the alteration and save it
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

    const savedUser = await userToUpdate.save()

    if (savedUser) {
      return response.status(200)
    }
  }
}
