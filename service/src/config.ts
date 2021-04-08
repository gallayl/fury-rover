import { Injector } from '@furystack/inject'
import { DataSetSettings } from '@furystack/repository'
import { VerboseConsoleLogger } from '@furystack/logging'
import { InMemoryStore } from '@furystack/core'
import { LogEntry, User, Session } from 'common'
import { join } from 'path'
import { FileStoreLogger } from './services/file-store-logger'
import { FileSystemStore } from '@furystack/filesystem-store'

export const storeFiles = {
  users: join(__filename, '..', '..', 'stores', 'users.json'),
  motors: join(__filename, '..', '..', 'stores', 'motors.json'),
  servos: join(__filename, '..', '..', 'stores', 'servos.json'),
  sessions: join(__filename, '..', '..', 'stores', 'sessions.json'),
}

export const authorizedOnly = async (options: { injector: Injector }) => {
  const authorized = await options.injector.isAuthenticated()
  return {
    isAllowed: authorized,
    message: 'You are not authorized :(',
  }
}

export const authorizedDataSet: Partial<DataSetSettings<any, any>> = {
  authorizeAdd: authorizedOnly,
  authorizeGet: authorizedOnly,
  authorizeRemove: authorizedOnly,
  authorizeUpdate: authorizedOnly,
  authroizeRemoveEntity: authorizedOnly,
}

export const injector = new Injector()
injector.useLogging(VerboseConsoleLogger)
injector
  .setupStores((stores) =>
    stores
      .addStore(new InMemoryStore({ model: Session, primaryKey: 'sessionId' }))
      .addStore(
        new InMemoryStore({
          model: LogEntry,
          primaryKey: 'date',
        }),
      )
      .addStore(
        new FileSystemStore({
          model: User,
          primaryKey: 'username',
          logger: injector.logger,
          fileName: storeFiles.users,
        }),
      )

      .addStore(
        new FileSystemStore({
          model: Session,
          primaryKey: 'sessionId',
          fileName: storeFiles.sessions,
          logger: injector.logger,
        }),
      ),
  )
  .useLogging(FileStoreLogger)
  .useHttpAuthentication({
    getUserStore: (sm) => sm.getStoreFor(User),
    getSessionStore: (sm) => sm.getStoreFor(Session),
  })
  .setupRepository((repo) =>
    repo.createDataSet(LogEntry, { ...authorizedDataSet }).createDataSet(User, {
      ...authorizedDataSet,
    }),
  )
