import { freemem, totalmem, uptime } from 'os'
import { cpuTemperature, currentLoad, Systeminformation } from 'systeminformation'
import { RequestAction, JsonResult } from '@furystack/rest'

export const GetSystemLoadAction: RequestAction<{
  result: {
    freemem: number
    totalmem: number
    uptime: number
    currentLoad: Systeminformation.CurrentLoadData
    cpuTemperature: Systeminformation.CpuTemperatureData
  }
}> = async () => {
  const [cpuTemperatureValue, currentLoadValue] = await Promise.all([
    new Promise<Systeminformation.CpuTemperatureData>((resolve) => cpuTemperature(resolve)),
    new Promise<Systeminformation.CurrentLoadData>((resolve) => currentLoad(resolve)),
  ])

  const responseBody = {
    freemem: freemem(),
    totalmem: totalmem(),
    uptime: uptime(),
    currentLoad: currentLoadValue,
    cpuTemperature: cpuTemperatureValue,
  }

  return JsonResult(responseBody)
}
