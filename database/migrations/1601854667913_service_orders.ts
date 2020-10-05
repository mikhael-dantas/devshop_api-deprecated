import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ServiceOrders extends BaseSchema {
  protected tableName = 'service_orders'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('order_status_id').references('id').inTable('order_statuses')
      table.integer('total_value')
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
