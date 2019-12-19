import { RequestAction, JsonResult } from '@furystack/http-api'
import { wake } from 'wake_on_lan'

export const WakeOnLanAction: RequestAction = async injector => {
  const postBody = await injector.getRequest().readPostBody<{ mac: string }>()
  return await new Promise((resolve, _reject) => {
    wake(postBody.mac, err => {
      if (err) {
        resolve(JsonResult({ error: err }, 500))
      } else {
        resolve(JsonResult({ success: true }))
      }
    })
  })
}
