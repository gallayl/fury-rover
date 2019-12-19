import { platform, type, release, hostname } from 'os'
import { cpu, mem, diskLayout, fsSize } from 'systeminformation'
import { RequestAction, JsonResult } from '@furystack/http-api'

export const GetSystemDetailsAction: RequestAction = async () => {
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
