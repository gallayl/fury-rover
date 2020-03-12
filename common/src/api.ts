import { RestApi, RequestAction } from '@furystack/rest'
import { Systeminformation } from 'systeminformation'
import { Motor } from './models'
import { User as FUser } from '@furystack/core'

export interface FuryRoverApi extends RestApi {
  GET: {
    '/isAuthenticated': RequestAction<{ result: { isAuthenticated: boolean } }>
    '/currentUser': RequestAction<{ result: FUser }>
    '/systemLoad': RequestAction<{
      result: {
        freemem: number
        totalmem: number
        uptime: number
        currentLoad: Systeminformation.CurrentLoadData
        cpuTemperature: Systeminformation.CpuTemperatureData
      }
    }>
    '/systemDetails': RequestAction<{
      result: {
        platform: NodeJS.Platform
        osType: string
        osRelease: string
        cpu: Systeminformation.CpuData
        hostname: string
        mem: Systeminformation.MemData
        diskLayout: Systeminformation.DiskLayoutData[]
        fsSize: Systeminformation.FsSizeData[]
      }
    }>
    '/motors': RequestAction<{ result: Motor[] }>
  }
  POST: {
    '/wakeOnLan': RequestAction<{ result: { success: boolean }; body: { mac: string } }>
    '/login': RequestAction<{ body: { username: string; password: string }; result: FUser }>
    '/logout': RequestAction<{}>
    '/googleLogin': RequestAction<{ body: { token: string }; result: FUser }>
    '/motors/stopAll': RequestAction<{}>
    '/motors/set4': RequestAction<{ body: [number, number, number, number] }>
    '/servos/setValues': RequestAction<{ body: Array<{ id: number; value: number }> }>
  }
}