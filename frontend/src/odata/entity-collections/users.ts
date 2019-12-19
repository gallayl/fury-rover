import '@furystack/odata-fetchr'
import { Injectable, Injector } from '@furystack/inject'
import { User } from '../entity-types/user'

/**
 * Service class for collection users
 * File created by @furystack/odata-fetchr
 */
@Injectable({ lifetime: 'singleton' })
export class Users {
  /**
   * Custom collection action 'current'
   */
  public current = () => this.getService().execCustomCollectionFunction<User>('current')
  /**
   * Custom collection action 'login'
   */
  public login = (params: { username: string; password: string }) =>
    this.getService().execCustomCollectionAction<User>('login', params)

  /**
   * Custom collection action 'logout'
   */
  public logout = () => this.getService().execCustomCollectionAction('logout')

  /**
   * Custom collection action 'isAuthenticated'
   */
  public isAuthenticated = () => this.getService().execCustomCollectionFunction<Record<string, any>>('isAuthenticated')

  public googleLogin = (params: { token: string }) =>
    this.getService().execCustomCollectionAction<User>('googleLogin', params)
  public readonly entitySetUrl = 'users'
  public getService = () => this.injector.getOdataServiceFor(User, 'users')
  constructor(private injector: Injector) {}
}
