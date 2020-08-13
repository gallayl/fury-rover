import '@furystack/core'
import '@furystack/repository'
import '@furystack/rest-service'
import { FuryRoverApi, Constants } from 'common'
import { MotorService } from './services'
import { LoginAction, LogoutAction, GetCurrentUser, IsAuthenticated, Authenticate } from '@furystack/rest-service'
import { JsonResult } from '@furystack/rest'
import { injector } from './config'
import { ServoService } from './services/servo-service'

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
        // ToDo: All
        const { direction, frontThrottle, rearLeftThrottle, rearRightThrottle, steer } = await getBody()
        const motorService = i.getInstance(MotorService)
        // service.setServos([{ servo: 'steer', percent: steerPercent }])
        await motorService.setDirection(Constants.MOTORS.front as Constants.MotorChannel, direction)
        await motorService.setDirection(Constants.MOTORS.rearLeft as Constants.MotorChannel, direction)
        await motorService.setDirection(Constants.MOTORS.rearRight as Constants.MotorChannel, direction)

        await motorService.setSpeed(Constants.MOTORS.front as Constants.MotorChannel, frontThrottle)
        await motorService.setSpeed(Constants.MOTORS.rearLeft as Constants.MotorChannel, rearLeftThrottle)
        await motorService.setSpeed(Constants.MOTORS.rearRight as Constants.MotorChannel, rearRightThrottle)

        await i
          .getInstance(ServoService)
          .setPwm({ channel: Constants.SERVOS.steer as Constants.ServoChannel, on: 0, off: steer })

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
        i.getInstance(ServoService).setPwm({
          channel: Constants.SERVOS[body.servo] as Constants.ServoChannel,
          on: body.on,
          off: body.off,
        })
        return JsonResult({}, 200)
      }),
      '/motors/set': Authenticate()(async ({ getBody, injector: i }) => {
        const { motor, direction, speed } = await getBody()
        i.getInstance(MotorService).setDirection(Constants.MOTORS[motor] as Constants.MotorChannel, direction)
        i.getInstance(MotorService).setSpeed(Constants.MOTORS[motor] as Constants.MotorChannel, speed)
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
