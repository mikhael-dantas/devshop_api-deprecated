import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ServiceOrders extends BaseSchema {
  protected tableName = 'service_orders'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.integer('user_id')
        .references('id')
        .inTable('users')
        .notNullable()
        .unsigned()
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('user_id')
    })
  }
}
