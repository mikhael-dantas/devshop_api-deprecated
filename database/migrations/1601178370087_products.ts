import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Products extends BaseSchema {
  protected tableName = 'products'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable().unsigned()
      table.string('name', 255).notNullable()
      table.text('description').nullable()
      table.integer('price', 8).notNullable().unsigned()
      table.integer('stock_qty', 6).notNullable().unsigned()
      table.boolean('active').notNullable().defaultTo(true)
      table.text('details').nullable()
      table.string('image_url').notNullable()
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
