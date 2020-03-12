import { Injector } from '@furystack/inject'
import { HttpUserContext } from '@furystack/rest-service'
import { DataSetSettings } from '@furystack/repository'
import { VerboseConsoleLogger } from '@furystack/logging'
import { FileStore, InMemoryStore } from '@furystack/core'
import { User, Session, Motor, Servo } from 'common'
import { join } from 'path'
import { MotorService } from './services'

export const storeFiles = {
  users: join(__filename, '..', '..', 'stores', 'users.json'),
  motors: join(__filename, '..', '..', 'stores', 'motors.json'),
  servos: join(__filename, '..', '..', 'stores', 'servos.json'),
}

export const authorizedOnly = async (options: { injector: Injector }) => {
  const authorized = await options.injector.getInstance(HttpUserContext).isAuthenticated()
  return {
    isAllowed: authorized,
    message: 'You are not authorized :(',
  }
}

export const authorizedDataSet: Partial<DataSetSettings<any>> = {
  authorizeAdd: authorizedOnly,
  authorizeGet: authorizedOnly,
  authorizeRemove: authorizedOnly,
  authorizeUpdate: authorizedOnly,
  authroizeRemoveEntity: authorizedOnly,
}

export const injector = new Injector()
injector.useLogging(VerboseConsoleLogger)
injector
  .setupStores(stores =>
    stores
      .addStore(
        new FileStore({
          model: User,
          primaryKey: 'username',
          logger: injector.logger,
          fileName: storeFiles.users,
        }),
      )
      .addStore(new InMemoryStore({ model: Session, primaryKey: 'sessionId' }))
      .addStore(
        new FileStore({
          model: Motor,
          primaryKey: 'id',
          fileName: storeFiles.motors,
          logger: injector.logger,
          tickMs: Number.MAX_SAFE_INTEGER,
        }),
      )
      .addStore(
        new FileStore({
          model: Servo,
          primaryKey: 'channel',
          fileName: storeFiles.servos,
          logger: injector.logger,
          tickMs: Number.MAX_SAFE_INTEGER,
        }),
      ),
  )
  .useHttpAuthentication({
    getUserStore: sm => sm.getStoreFor(User),
    getSessionStore: sm => sm.getStoreFor(Session),
  })
  .setupRepository(repo =>
    repo
      .createDataSet(User, {
        ...authorizedDataSet,
        name: 'users',
      })
      .createDataSet(Servo, {
        name: 'servos',
        authorizeAdd: async () => ({
          isAllowed: false,
          message: 'Cannot add an entity into a prepopulated hardware collection',
        }),
        onEntityUpdated: async ({ injector: i, id, change }) => {
          change.currentValue && i.getInstance(MotorService).setServos([{ id, value: change.currentValue }])
        },
      })
      .createDataSet(Motor, {
        name: 'motors',
        authorizeAdd: async () => ({
          isAllowed: false,
          message: 'Cannot add an entity into a prepopulated hardware collection',
        }),
        onEntityUpdated: async ({ injector: i, id, change }) => {
          change.value && i.getInstance(MotorService).setMotorValue(id as number, change.value)
        },
      }),
  )
