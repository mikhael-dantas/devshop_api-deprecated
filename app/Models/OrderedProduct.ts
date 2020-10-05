import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import ServiceOrder from './ServiceOrder'
import Product from './Product'

export default class OrderedProduct extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public purchased_price: number

  @column()
  public product_name: string

  @column()
  public product_description: string

  @column()
  public qty: number

  @column()
  public productId: number

  @column()
  public serviceOrderId: number

  @belongsTo(() => ServiceOrder)
  public serviceOrder: BelongsTo<typeof ServiceOrder>

  @belongsTo(() => Product)
  public product: BelongsTo<typeof Product>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
