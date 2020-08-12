import '@furystack/core'
import '@furystack/repository'
import '@furystack/rest-service'
import { FuryRoverApi } from 'common'
import { MotorService } from './services'
import { LoginAction, LogoutAction, GetCurrentUser, IsAuthenticated, Authenticate } from '@furystack/rest-service'
import { JsonResult } from '@furystack/rest'
import { injector } from './config'

injector.useRestService<FuryRoverApi>({
  root: 'api',
  api: {
    GET: {
      '/currentUser': GetCurrentUser,
      '/isAuthenticated': IsAuthenticated,
    },
    POST: {
      '/login': LoginAction,
      '/logout': LogoutAction,
      '/move': Authenticate()(async ({ getBody, injector: i }) => {
        const { frontPercent, rearLeftPercent, rearRightPercent, steerPercent, direction } = await getBody()
        const service = i.getInstance(MotorService)
        service.setServos([{ servo: 'steer', percent: steerPercent }])
        await service.setMotorValue('front', direction, frontPercent)
        await service.setMotorValue('rearLeft', direction, rearLeftPercent)
        await service.setMotorValue('rearRight', direction, rearRightPercent)
        return JsonResult({}, 200)
      }),
      '/motors/stopAll': Authenticate()(async ({ injector: i }) => {
        i.getInstance(MotorService).stopAll()
        return JsonResult({}, 200)
      }),
      '/release': Authenticate()(async ({ injector: i }) => {
        const motorService = i.getInstance(MotorService)
        motorService.setServos([{ servo: 'steer', percent: 50 }])
        motorService.stopAll()
        return JsonResult({}, 200)
      }),
      '/servos/setValues': Authenticate()(async ({ injector: i, getBody }) => {
        const body = await getBody()
        i.getInstance(MotorService).setServos(body)
        return JsonResult({}, 200)
      }),
      '/servos/calibrate': Authenticate()(async ({ injector: i, getBody }) => {
        const body = await getBody()
        body.map(({ servo, freq, min, max, percent }) =>
          i.getInstance(MotorService).calibrateServo(servo, freq, min, max, percent),
        )
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
