import { join } from 'path'
import { seed } from './seed'
import '@furystack/rest-service'
import { User, Session, Servo, Motor, FuryRoverApi } from 'common'
import { MotorService } from './services'
import { LoginAction, LogoutAction, HttpUserContext, GetCurrentUser, IsAuthenticated } from '@furystack/rest-service'
import { JsonResult } from '@furystack/rest'
import { InMemoryStore, FileStore } from '@furystack/core'
import { Injector } from '@furystack/inject'
import { GoogleLoginAction } from '@furystack/auth-google'
import { VerboseConsoleLogger } from '@furystack/logging'
import '@furystack/core'
import { DataSetSettings } from '@furystack/repository'
import { GetSystemLoadAction, GetSystemDetailsAction, WakeOnLanAction } from './actions'

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

export const i = new Injector().useLogging(VerboseConsoleLogger)
i.setupStores(stores =>
  stores
    .addStore(
      new FileStore({
        model: User,
        primaryKey: 'username',
        logger: i.logger,
        fileName: join(__filename, '..', '..', 'users.json'),
      }),
    )
    .addStore(new InMemoryStore({ model: Session, primaryKey: 'sessionId' }))
    .addStore(new InMemoryStore({ model: Motor, primaryKey: 'id' }))
    .addStore(new InMemoryStore({ model: Servo, primaryKey: 'channel' })),
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
        onEntityUpdated: async ({ injector, id, change }) => {
          change.currentValue && injector.getInstance(MotorService).setServos([{ id, value: change.currentValue }])
        },
      })
      .createDataSet(Motor, {
        name: 'motors',
        authorizeAdd: async () => ({
          isAllowed: false,
          message: 'Cannot add an entity into a prepopulated hardware collection',
        }),
        onEntityUpdated: async ({ injector, id, change }) => {
          change.value && injector.getInstance(MotorService).setMotorValue(id as number, change.value)
        },
      }),
  )
i.useRestService<FuryRoverApi>({
  root: 'api',
  api: {
    GET: {
      '/currentUser': GetCurrentUser,
      '/isAuthenticated': IsAuthenticated,
      '/systemLoad': GetSystemLoadAction,
      '/systemDetails': GetSystemDetailsAction,
      '/motors': async ({ injector }) => {
        const motors: Motor[] = await injector.getDataSetFor(Motor).filter(injector, { top: 100 })
        return JsonResult(motors)
      },
    },
    POST: {
      '/googleLogin': GoogleLoginAction,
      '/login': LoginAction,
      '/logout': LogoutAction,
      '/wakeOnLan': WakeOnLanAction,
      '/motors/set4': async ({ getBody, injector }) => {
        const body = await getBody()
        injector.getInstance(MotorService).set4(body)
        return JsonResult({}, 200)
      },
      '/motors/stopAll': async ({ injector }) => {
        injector.getInstance(MotorService).stopAll()
        return JsonResult({}, 200)
      },
      '/servos/setValues': async ({ injector, getBody }) => {
        const values = await getBody()
        injector.getInstance(MotorService).setServos(values)
        return JsonResult({}, 200)
      },
    },
  },
  port: parseInt(process.env.APP_SERVICE_PORT as string, 10) || 9090,
  cors: {
    credentials: true,
    origins: ['http://localhost:8080', 'http://192.168.0.150'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH' as any],
  },
})
i.disposeOnProcessExit()

i.getInstance(MotorService)

seed(i)
