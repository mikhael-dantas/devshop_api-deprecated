/* eslint-disable max-len */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ApiValidSchemas } from '../../utils/ApiValidSchemas'

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
  public async index ({ request, auth}: HttpContextContract) {
    const validatedData = await request.validate({schema: ApiValidSchemas.products.get})

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

    const wherenotParams = {}
    if (!auth.user?.is_admin) {
      wherenotParams['active'] = 0
    }

    // query
    const productQuery = await Product.query()
      .where(params)
      .whereNot(wherenotParams)
      .orderBy(validatedData.sort, this.returnOrderString(validatedData.order))
      .paginate(validatedData.page, validatedData.pagination)

    return productQuery
  }

  public async store ({ request, response, auth }: HttpContextContract) {
    // validate params
    const validatedData = await request.validate({schema: ApiValidSchemas.products.post})

    const loggedUserId = auth.user?.id
    const user = await User.query().where({id: loggedUserId})

    if (!user || !user[0].is_admin) {
      return response.status(401)
    }

    // create product and return it
    const product = await Product.create({
      name: validatedData.name,
      description: validatedData.description,
      price: validatedData.price,
      active: validatedData.active,
      stock_qty: validatedData.stock_qty,
      image_url: validatedData.image_url,
      details: JSON.stringify(validatedData.details),
    })

    return product
  }

  public async update ({ request, response, params, auth }: HttpContextContract) {
    // validate params
    const userId = auth.user?.id
    const user = await User.query().where({id: userId})
    if (!user || !user[0].is_admin) {
      return response.status(401)
    }

    const validatedData = await request.validate({schema: ApiValidSchemas.products.put})

    const routeId = params.id

    const product = await Product.findBy('id', routeId)
    if (!product) {
      return response.status(404)
    }

    // assign given fields
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
    if (validatedData.details) {
      product.details = JSON.stringify(validatedData.details)
    }

    // save product and return it
    const savedproduct = await product.save()

    return savedproduct
  }
}
