import { Users } from '../odata/entity-collections'
import { User } from '../odata/entity-types'
import { Injectable } from '@furystack/inject'
import { ObservableValue, usingAsync, sleepAsync } from '@furystack/utils'

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
        const { isAuthenticated } = await this.users.isAuthenticated()
        this.state.setValue(isAuthenticated ? 'authenticated' : 'unauthenticated')
        if (isAuthenticated) {
          const usr = await this.users.current()
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
        const usr = await this.users.login({ username, password })
        this.currentUser.setValue(usr)
        this.state.setValue('authenticated')
      } catch (error) {
        this.loginError.setValue(error.body.message)
      }
    })
  }

  public async logout() {
    await usingAsync(this.operation(), async () => {
      this.users.logout()
      this.currentUser.setValue(null)
      this.state.setValue('unauthenticated')
    })
  }

  constructor(private users: Users) {
    this.init()
  }
}
