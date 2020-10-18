import '@furystack/core'
import '@furystack/repository'
import '@furystack/rest-service'
import { FuryRoverApi, Constants } from 'common'
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
        const { direction, throttle, steer } = await getBody()
        const motorService = i.getInstance(MotorService)

        const steerValue = steer - 50

        if (direction === 'release') {
          await motorService.stopAll()
          return JsonResult({}, 200)
        }

        await motorService.setMotorValue(
          Constants.MOTORS.left,
          (direction === 'back' ? -1 : 1) * throttle * (steerValue * 0.01),
        )
        await motorService.setMotorValue(
          Constants.MOTORS.right,
          (direction === 'back' ? -1 : 1) * throttle * (-steerValue * 0.01),
        )
        return JsonResult({}, 200)
      }),
      '/motors/stopAll': Authenticate()(async ({ injector: i }) => {
        i.getInstance(MotorService).stopAll()
        return JsonResult({}, 200)
      }),
      '/release': Authenticate()(async ({ injector: i }) => {
        const motorService = i.getInstance(MotorService)
        motorService.stopAll()
        return JsonResult({}, 200)
      }),
      '/servos/set': Authenticate()(async ({ getBody, injector: i }) => {
        const body = await getBody()
        i.getInstance(MotorService).setServos([
          {
            id: Constants.SERVOS[body.servo] as Constants.ServoChannel,
            value: body.off,
          },
        ])
        return JsonResult({}, 200)
      }),
      '/motors/set': Authenticate()(async ({ getBody, injector: i }) => {
        const { motor, direction, speed } = await getBody()
        await i
          .getInstance(MotorService)
          .setMotorValue(Constants.MOTORS[motor], (direction === 'back' ? -1 : 1) * speed)
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
