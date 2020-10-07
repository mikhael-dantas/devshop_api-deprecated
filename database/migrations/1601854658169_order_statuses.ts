import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class OrderStatuses extends BaseSchema {
  protected tableName = 'order_statuses'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable().unsigned()
      table.integer('status_code').defaultTo(0).notNullable()
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
