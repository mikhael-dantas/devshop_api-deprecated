import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class SessionsController {
  public async store ({request, response, auth}: HttpContextContract) {
    const productsSchema = schema.create({
      email: schema.string(),
      password: schema.string(),
    })

    const validatedData = await request.validate({schema: productsSchema})

    const token = await auth.use('api').attempt(validatedData.email, validatedData.password, {
      expiresIn: '1 hour',
    })
    return response.send(token.toJSON())
  }
}
