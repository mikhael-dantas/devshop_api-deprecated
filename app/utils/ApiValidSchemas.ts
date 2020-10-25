import { schema, rules } from '@ioc:Adonis/Core/Validator'

export const ApiValidSchemas = {
  users: {
    get: schema.create({
      all: schema.boolean.optional(),
      admins: schema.boolean.optional(),
    }),

    post: schema.create({
      email: schema.string({}, [
        rules.minLength(5),
        rules.maxLength(255),
        rules.regex(/^([A-Za-z0-9_-]*$)/),
      ]),
      password: schema.string({}, [
        rules.minLength(6),
        rules.maxLength(180),
        rules.regex(/^\S*$/),
      ]),
    }),

    put: schema.create({
      email: schema.string(),
      money_to_add: schema.number.optional([
        rules.requiredIfNotExistsAll(['is_admin']),
        rules.range(0, 9999999),
        rules.integer(),
        rules.unsigned(),
      ]),
      is_admin: schema.boolean.optional([
        rules.requiredIfNotExistsAll(['money_to_add']),
      ]),
    }),
  },

  sessions: {
    post: schema.create({
      email: schema.string(),
      password: schema.string(),
    }),
  },

  products: {
    get: schema.create({
      id: schema.number.optional([rules.integer()]),
      page: schema.number.optional([rules.integer()]),
      pagination: schema.number.optional([rules.range(2, 100), rules.integer()]),
      order: schema.string.optional({}, [rules.regex(/^(asc|desc)$/)]),
      sort: schema.string.optional({}, [
        rules.regex(/^(price|name)$/),
        rules.requiredIfExists('order'),
      ]),
    }),

    post: schema.create({
      name: schema.string({}, [rules.maxLength(255)]),
      description: schema.string.optional(),
      price: schema.number([rules.integer(), rules.range(0, 99999999)]),
      stock_qty: schema.number([rules.integer(), rules.range(0, 999999)]),
      image_url: schema.string(),
      active: schema.boolean(),
      details: schema.array.optional().members(
        schema.object().members({
          title: schema.string(),
          detail: schema.string(),
        })
      ),
    }),

    put: schema.create({
      name: schema.string.optional({}, [rules.maxLength(255)]),
      description: schema.string.optional(),
      price: schema.number.optional([rules.integer(), rules.range(0, 99999999)]),
      stock_qty: schema.number.optional([rules.integer(), rules.range(0, 999999)]),
      image_url: schema.string.optional(),
      active: schema.boolean.optional(),
      details: schema.array.optional().members(
        schema.object().members({
          title: schema.string(),
          detail: schema.string(),
        })
      ),
    }),
  },

  serviceorders: {
    get: schema.create({
      id: schema.number.optional([rules.integer()]),
      page: schema.number.optional([rules.integer()]),
      pagination: schema.number.optional([rules.integer(), rules.range(2, 100)]),
      order: schema.string.optional({}, [rules.regex(/^(asc|desc)$/)]),
      sort: schema.string.optional({}, [
        rules.regex(/^(created_at|total_value)$/),
        rules.requiredIfExists('order'),
      ]),
    }),

    post: schema.create({
      products: schema.array().members(schema.object().members({
        product_id: schema.number([rules.integer()]),
        qty: schema.number([rules.integer()]),
      })),
    }),
  },

  walletpayments: {
    post: schema.create({
      service_order_id: schema.number([
        rules.integer(),
      ]),
    }),
  },
}
