import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import OrderStatus from './OrderStatus'
import OrderedProduct from './OrderedProduct'

export default class ServiceOrder extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public orderStatusId: number

  @column()
  public total_value: number

  @hasMany(() => OrderedProduct)
  public orderedProducts: HasMany<typeof OrderedProduct>

  @belongsTo(() => OrderStatus)
  public orderStatus: BelongsTo<typeof OrderStatus>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
