import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Wallets extends BaseSchema {
  protected tableName = 'wallets'

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
