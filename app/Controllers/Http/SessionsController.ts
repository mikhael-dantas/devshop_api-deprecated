import Env from '@ioc:Adonis/Core/Env'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ApiValidSchemas } from '../../utils/ApiValidSchemas'

export default class SessionsController {
  public async store ({request, response, auth}: HttpContextContract) {
    const validatedData = await request.validate({schema: ApiValidSchemas.sessions.post})

    const token = await auth.use('api').attempt(validatedData.email, validatedData.password, {
      expiresIn: `${Env.get('USER_SESSION_EXP_TIME', '18')} hours`,
    })
    return response.send(token.toJSON())
  }

  public async delete ({ auth, response }: HttpContextContract) {
    await auth.use('api').logout()
    const logout = await auth.check()

    if (logout) {
      return response.status(500).json({message: 'error ocurred in logout'})
    }

    return response.status(200)
  }
}
