import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import ServiceOrder from './ServiceOrder'

export default class OrderStatus extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @hasOne(() => ServiceOrder)
  public serviceOrder: HasOne<typeof ServiceOrder>

  @column()
  public statusCode: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
