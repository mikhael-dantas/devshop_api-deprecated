/* eslint-disable max-len */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

import Product from 'App/Models/Product'

export default class ProductsController {
  private returnOrderString (order:any) {
    switch (order) {
      case 'asc':
        return 'asc'
      case 'desc':
        return 'desc'
      default:
        return 'asc'
    }
  }
  public async index ({ request, response }: HttpContextContract) {
    try {
      const productsSchema = schema.create({
        id: schema.number.optional(),
        page: schema.number.optional(),
        pagination: schema.number.optional([rules.range(2, 100)]),
        order: schema.string.optional({}, [rules.regex(/^(asc|desc)$/)]),
        sort: schema.string.optional({}, [rules.regex(/^(price|name)$/), rules.requiredIfExists('order')]),
      })

      const validatedData = await request.validate({schema: productsSchema})

      // set default values and params
      if (!validatedData.page) {
        validatedData.page = 1
      }

      if (!validatedData.sort) {
        validatedData.sort = 'name'
        validatedData.order = 'asc'
      }

      const params = {}
      if (validatedData.id) {
        params['id'] = validatedData.id
      }

      // query
      const productQuery = await Product.query()
        .where(params)
        .orderBy(validatedData.sort, this.returnOrderString(validatedData.order))
        .paginate(validatedData.page, validatedData.pagination)

      return productQuery
    } catch (error) {
      response.status(error.status).send(error.messages)
    }
  }

  public async store ({ request, response }: HttpContextContract) {
    const productsSchema = schema.create({
      name: schema.string(),
      description: schema.string.optional(),
      price: schema.number(),
      stock_qty: schema.number(),
      image_url: schema.string(),
    })

    const validatedData = await request.validate({schema: productsSchema})

    const details = request.input('details')

    if (typeof details !== 'object') {
      return response.status(400).json({message: 'invalid details'})
    }

    let invalidCount = 0
    Object.values(details).forEach(detail => {
      if (!['number', 'string'].includes(typeof detail)) {
        invalidCount += 1
      }
    })

    if (invalidCount > 0) {
      return response.status(400).json({message: `${invalidCount} invalid details`})
    }

    validatedData['details'] = JSON.stringify(details)

    const product = await Product.create(validatedData)

    return product
  }
}
