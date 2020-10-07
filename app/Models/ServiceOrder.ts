import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import OrderStatus from './OrderStatus'
import OrderedProduct from './OrderedProduct'
import User from './User'

export default class ServiceOrder extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public orderStatusId: number

  @column()
  public total_value: number

  @column()
  public userId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => OrderedProduct)
  public orderedProducts: HasMany<typeof OrderedProduct>

  @belongsTo(() => OrderStatus)
  public orderStatus: BelongsTo<typeof OrderStatus>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
