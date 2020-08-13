import { RestApi, RequestAction } from '@furystack/rest'
import { User as FUser } from '@furystack/core'
import { SERVOS, Direction, MOTORS } from './constants'

export interface FuryRoverApi extends RestApi {
  GET: {
    '/isAuthenticated': RequestAction<{ result: { isAuthenticated: boolean } }>
    '/currentUser': RequestAction<{ result: FUser }>
  }
  POST: {
    '/login': RequestAction<{ body: { username: string; password: string }; result: FUser }>
    '/logout': RequestAction<{}>
    '/motors/stopAll': RequestAction<{}>
    '/move': RequestAction<{
      body: {
        direction: Direction
        steer: number
        frontThrottle: number
        rearLeftThrottle: number
        rearRightThrottle: number
      }
    }>
    '/release': RequestAction<{}>
    '/motors/set': RequestAction<{
      body: { motor: keyof typeof MOTORS; direction: Direction; speed: number }
    }>
    '/servos/set': RequestAction<{
      body: { servo: keyof typeof SERVOS; on: number; off: number }
    }>
  }
}
