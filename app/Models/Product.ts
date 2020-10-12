import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import OrderedProduct from './OrderedProduct'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public stock_qty: number

  @column()
  public price: number

  @column()
  public image_url: string

  @column()
  public details: string

  @column()
  public active: boolean

  @hasMany(() => OrderedProduct)
  public orderedProducts: HasMany<typeof OrderedProduct>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
