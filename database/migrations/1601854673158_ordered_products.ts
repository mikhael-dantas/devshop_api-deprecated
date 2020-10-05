import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class OrderedProducts extends BaseSchema {
  protected tableName = 'ordered_products'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('product_id').references('id').inTable('products')
      table.integer('service_order_id').references('id').inTable('service_orders')
      table.integer('purchased_price')
      table.string('product_name')
      table.string('product_description')
      table.string('qty')
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
