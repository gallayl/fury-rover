import '@furystack/core'
import '@furystack/repository'
import '@furystack/rest-service'
import { Motor, FuryRoverApi, LogEntry } from 'common'
import { MotorService } from './services'
import { LoginAction, LogoutAction, GetCurrentUser, IsAuthenticated, Authenticate } from '@furystack/rest-service'
import { JsonResult } from '@furystack/rest'
import { injector } from './config'
import { GoogleLoginAction } from '@furystack/auth-google'
import { GetSystemLoadAction, GetSystemDetailsAction, WakeOnLanAction } from './actions'

injector.useRestService<FuryRoverApi>({
  root: 'api',
  api: {
    GET: {
      '/currentUser': GetCurrentUser,
      '/isAuthenticated': IsAuthenticated,
      '/systemLoad': Authenticate()(GetSystemLoadAction),
      '/systemDetails': Authenticate()(GetSystemDetailsAction),
      '/motors': Authenticate()(async ({ injector: i }) => {
        const motors: Motor[] = await i.getDataSetFor(Motor).filter(i, { top: 100 })
        return JsonResult(motors)
      }),
      '/systemLog': Authenticate()(async ({ injector: i, getBody }) => {
        const filter = await getBody()
        const result = await i.getDataSetFor<LogEntry>('logEntries').filter(i, filter)
        return JsonResult(result as LogEntry[])
      }),
    },
    POST: {
      '/googleLogin': GoogleLoginAction,
      '/login': LoginAction,
      '/logout': LogoutAction,
      '/wakeOnLan': Authenticate()(WakeOnLanAction),
      '/move': Authenticate()(async ({ getBody, injector: i }) => {
        const { frontLeft, backLeft, frontRight, backRight, steer } = await getBody()
        const service = i.getInstance(MotorService)
        service.set4([frontLeft, backLeft, frontRight, backRight])
        service.setServos([
          { id: 14, value: steer },
          { id: 15, value: steer },
        ])
        return JsonResult({}, 200)
      }),
      '/motors/stopAll': Authenticate()(async ({ injector: i }) => {
        i.getInstance(MotorService).stopAll()
        return JsonResult({}, 200)
      }),
      '/servos/setValues': Authenticate()(async ({ injector: i, getBody }) => {
        const values = await getBody()
        i.getInstance(MotorService).setServos(values)
        return JsonResult({}, 200)
      }),
      '/release': Authenticate()(async ({ injector: i }) => {
        const motorService = i.getInstance(MotorService)
        motorService.setServos([
          { id: 14, value: 90 },
          { id: 15, value: 90 },
        ])
        motorService.stopAll()
        return JsonResult({}, 200)
      }),
    },
  },
  port: parseInt(process.env.APP_SERVICE_PORT as string, 10) || 9090,
  cors: {
    credentials: true,
    origins: ['http://localhost:8080', 'http://192.168.0.150'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH' as any],
  },
})
injector.disposeOnProcessExit()
injector.getInstance(MotorService)
