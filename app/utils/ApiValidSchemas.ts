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
}
