import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Wallet from './Wallet'
import ServiceOrder from './ServiceOrder'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @hasOne(() => Wallet)
  public wallet: HasOne<typeof Wallet>

  @hasMany(() => ServiceOrder)
  public serviceOrder: HasMany<typeof ServiceOrder>

  @column()
  public key: string

  @column()
  public is_admin: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
