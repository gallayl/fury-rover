import { Injectable } from '@furystack/inject'
import { ObservableValue, usingAsync, sleepAsync } from '@furystack/utils'
import { User } from '@furystack/core'
import { RestClient } from './rest-client'

export type sessionState = 'initializing' | 'offline' | 'unauthenticated' | 'authenticated'

@Injectable({ lifetime: 'singleton' })
export class SessionService {
  private readonly operation = () => {
    this.isOperationInProgress.setValue(true)
    return { dispose: () => this.isOperationInProgress.setValue(false) }
  }

  public state = new ObservableValue<sessionState>('initializing')
  public currentUser = new ObservableValue<User | null>(null)

  public isOperationInProgress = new ObservableValue(true)

  public loginError = new ObservableValue('')
  private async init() {
    await usingAsync(this.operation(), async () => {
      try {
        const { isAuthenticated } = await this.api.call({ method: 'GET', action: '/isAuthenticated' })
        this.state.setValue(isAuthenticated ? 'authenticated' : 'unauthenticated')
        if (isAuthenticated) {
          const usr = await this.api.call({ method: 'GET', action: '/currentUser' })
          this.currentUser.setValue(usr)
        }
      } catch (error) {
        this.state.setValue('offline')
      }
    })
  }

  public async login(username: string, password: string) {
    await usingAsync(this.operation(), async () => {
      try {
        await sleepAsync(2000)
        const usr = await this.api.call({ method: 'POST', action: '/login', body: { username, password } })
        this.currentUser.setValue(usr)
        this.state.setValue('authenticated')
      } catch (error) {
        this.loginError.setValue(error.body.message)
      }
    })
  }

  public async logout() {
    await usingAsync(this.operation(), async () => {
      this.api.call({ method: 'POST', action: '/logout' })
      this.currentUser.setValue(null)
      this.state.setValue('unauthenticated')
    })
  }

  constructor(private api: RestClient) {
    this.init()
  }
}
