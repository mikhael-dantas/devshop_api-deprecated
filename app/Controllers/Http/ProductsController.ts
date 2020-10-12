/* eslint-disable max-len */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

import Product from 'App/Models/Product'
import User from 'App/Models/User'

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
        .whereNot({active: 0})
        .orderBy(validatedData.sort, this.returnOrderString(validatedData.order))
        .paginate(validatedData.page, validatedData.pagination)

      return productQuery
    } catch (error) {
      response.status(error.status).send(error.messages)
    }
  }

  public async store ({ request, response, auth }: HttpContextContract) {
    const userId = auth.user?.id
    const user = await User.query().where({id: userId})
    if (!user || !user[0].is_admin) {
      return response.status(401)
    }

    const productsSchema = schema.create({
      name: schema.string(),
      description: schema.string.optional(),
      price: schema.number(),
      stock_qty: schema.number(),
      image_url: schema.string(),
      active: schema.boolean(),
    })

    const validatedData = await request.validate({schema: productsSchema})

    let details = request.input('details')

    if (!details) {
      details = {}
    }

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

  public async update ({ request, response, params, auth }: HttpContextContract) {
    const userId = auth.user?.id
    const user = await User.query().where({id: userId})
    if (!user || !user[0].is_admin) {
      return response.status(401)
    }

    const {id} = params

    try {
      const product = await Product.findByOrFail('id', id)

      const productsSchema = schema.create({
        name: schema.string.optional(),
        description: schema.string.optional(),
        price: schema.number.optional(),
        stock_qty: schema.number.optional(),
        image_url: schema.string.optional(),
        active: schema.boolean.optional(),
      })

      const validatedData = await request.validate({schema: productsSchema})

      let details = request.input('details')

      if (details) {
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
      }

      if (validatedData.name) {
        product.name = validatedData.name
      }
      if (validatedData.description) {
        product.description = validatedData.description
      }
      if (validatedData.price) {
        product.price = validatedData.price
      }
      if (validatedData.image_url) {
        product.image_url = validatedData.image_url
      }
      if (validatedData.stock_qty) {
        product.stock_qty = validatedData.stock_qty
      }
      if (validatedData.active) {
        product.active = validatedData.active
      }
      if (validatedData['details']) {
        product.details = validatedData['details']
      }

      const savedproduct = await product.save()

      if (!savedproduct) {
        return response.status(500).json({message: 'error saving'})
      }

      return response.status(200).send(savedproduct.toJSON)
    } catch (error) {
      return response.status(400).json({message: 'product does not exist'})
    }
  }

  public async delete ({ response, params, auth }: HttpContextContract) {
    const userId = auth.user?.id
    const user = await User.query().where({id: userId})
    if (!user || !user[0].is_admin) {
      return response.status(401)
    }

    const {id} = params

    try {
      const product = await Product.findByOrFail('id', id)

      product.active = (false)
      await product.save()

      return response.status(200)
    } catch (error) {
      return response.status(400).json({message: 'product does not exist'})
    }
  }
}
