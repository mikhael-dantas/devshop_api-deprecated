import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel, hasOne, hasMany, HasOne, HasMany,
} from '@ioc:Adonis/Lucid/Orm'
import Wallet from './Wallet'
import ServiceOrder from './ServiceOrder'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public password: string

  @column()
  public rememberMeToken?: string

  @hasOne(() => Wallet)
  public wallet: HasOne<typeof Wallet>

  @hasMany(() => ServiceOrder)
  public serviceOrder: HasMany<typeof ServiceOrder>

  @column()
  public is_admin: boolean

  @column()
  public is_master: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
