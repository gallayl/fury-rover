import { RequestAction, JsonResult, RequestError } from '@furystack/rest'
import { wake } from 'wake_on_lan'

export const WakeOnLanAction: RequestAction<{ result: { success: boolean }; body: { mac: string } }> = async ({
  getBody,
}) => {
  const { mac } = await getBody()
  return await new Promise((resolve, _reject) => {
    wake(mac, err => {
      if (err) {
        throw new RequestError('Failed to wake on lan', 500)
      } else {
        resolve(JsonResult({ success: true }))
      }
    })
  })
}
