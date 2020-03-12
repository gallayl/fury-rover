import '@furystack/core'
import '@furystack/repository'
import '@furystack/rest-service'
import { Motor, FuryRoverApi } from 'common'
import { MotorService } from './services'
import { LoginAction, LogoutAction, GetCurrentUser, IsAuthenticated } from '@furystack/rest-service'
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
      '/systemLoad': GetSystemLoadAction,
      '/systemDetails': GetSystemDetailsAction,
      '/motors': async ({ injector: i }) => {
        const motors: Motor[] = await i.getDataSetFor(Motor).filter(i, { top: 100 })
        return JsonResult(motors)
      },
    },
    POST: {
      '/googleLogin': GoogleLoginAction,
      '/login': LoginAction,
      '/logout': LogoutAction,
      '/wakeOnLan': WakeOnLanAction,
      '/motors/set4': async ({ getBody, injector: i }) => {
        const body = await getBody()
        i.getInstance(MotorService).set4(body)
        return JsonResult({}, 200)
      },
      '/motors/stopAll': async ({ injector: i }) => {
        i.getInstance(MotorService).stopAll()
        return JsonResult({}, 200)
      },
      '/servos/setValues': async ({ injector: i, getBody }) => {
        const values = await getBody()
        i.getInstance(MotorService).setServos(values)
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
injector.disposeOnProcessExit()
injector.getInstance(MotorService)
