import { PathHelper } from '@furystack/utils'
import { Injectable } from '@furystack/inject'
import { createClient } from '@furystack/rest-client-fetch'
import { FuryRoverApi } from 'common'
import { environmentOptions } from '../index'

@Injectable({ lifetime: 'singleton' })
export class RestClient {
  public call = createClient<FuryRoverApi>({
    endpointUrl: PathHelper.joinPaths(environmentOptions.serviceUrl, 'api'),
    requestInit: {
      credentials: 'include',
      mode: 'cors',
    },
  })
}
