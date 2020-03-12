import { platform, type, release, hostname } from 'os'
import { Systeminformation, cpu, mem, diskLayout, fsSize } from 'systeminformation'
import { RequestAction, JsonResult } from '@furystack/rest'

export const GetSystemDetailsAction: RequestAction<{
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
}> = async () => {
  const [cpuValue, memValue, diskLayoutValue, fsSizeValue] = await Promise.all([cpu(), mem(), diskLayout(), fsSize()])

  const responseBody = {
    platform: platform(),
    osType: type(),
    osRelease: release(),
    cpu: cpuValue,
    hostname: hostname(),
    mem: memValue,
    diskLayout: diskLayoutValue,
    fsSize: fsSizeValue,
  }

  return JsonResult(responseBody)
}
