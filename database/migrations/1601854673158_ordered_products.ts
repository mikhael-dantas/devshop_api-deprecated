import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class OrderedProducts extends BaseSchema {
  protected tableName = 'ordered_products'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('product_id')
        .references('id')
        .inTable('products')
        .notNullable()
      table.integer('service_order_id')
        .references('id')
        .inTable('service_orders')
        .notNullable()
      table.integer('purchased_price').notNullable().unsigned()
      table.string('product_name', 255).notNullable()
      table.text('product_description')
      table.integer('qty', 2).notNullable().unsigned()
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
