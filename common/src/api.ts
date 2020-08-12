import { RestApi, RequestAction } from '@furystack/rest'
import { User as FUser } from '@furystack/core'
import { Direction } from 'motor-hat'
import { SERVOS } from './constants'

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
        steerPercent: number
        frontPercent: number
        rearLeftPercent: number
        rearRightPercent: number
      }
    }>
    '/release': RequestAction<{}>
    '/servos/setValues': RequestAction<{
      body: Array<{ servo: keyof typeof SERVOS; percent: number }>
    }>
    '/servos/calibrate': RequestAction<{
      body: Array<{ servo: keyof typeof SERVOS; freq: number; min: number; max: number; percent: number }>
    }>
  }
}
