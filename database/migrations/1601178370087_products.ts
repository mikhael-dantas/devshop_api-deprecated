import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Products extends BaseSchema {
  protected tableName = 'products'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable().unsigned()
      table.string('name').notNullable()
      table.string('description')
      table.integer('price').notNullable().unsigned()
      table.integer('stock_qty').notNullable().unsigned()
      table.string('image_url').notNullable()
      table.boolean('active').notNullable().defaultTo(true)
      table.string('details')
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
