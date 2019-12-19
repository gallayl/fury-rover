import { parse } from 'url'
import { RouteModel } from '@furystack/http-api'
import { GetSystemDetailsAction, GetSystemLoadAction, WakeOnLanAction } from './actions'

export const routing: RouteModel = injector => {
  // Moved stuff to OData

  const msg = injector.getRequest()

  const urlPathName = parse(msg.url || '', true).pathname

  /**
   * GET Requests section.
   */
  if (msg.method === 'GET') {
    switch (urlPathName) {
      case '/getSystemLoad':
        return GetSystemLoadAction
      case '/getSystemDetails':
        return GetSystemDetailsAction
      default:
        break
    }
  }

  /**
   * POST requests section
   */
  if (msg.method === 'POST') {
    switch (urlPathName) {
      case '/wake':
        return WakeOnLanAction
      default:
        break
    }
  }
  return undefined
}
