/** ToDo: Main entry point */
import { PathHelper } from '@furystack/utils'
import { Injector } from '@furystack/inject'
import { createComponent, initializeShadeRoot } from '@furystack/shades'
import { VerboseConsoleLogger } from '@furystack/logging'
import { Layout } from './components/layout'
import '@furystack/odata-fetchr'
import './services/google-auth-provider'

import { Motors, Servos } from './odata/entity-collections'

const shadeInjector = new Injector()

export const environmentOptions = {
  nodeEnv: process.env.NODE_ENV as 'development' | 'production',
  debug: Boolean(process.env.DEBUG),
  appVersion: process.env.APP_VERSION as string,
  buildDate: new Date(process.env.BUILD_DATE as string),
  serviceUrl: (process.env.SERVICE_URL as string) || `${window.location.protocol}//${window.location.hostname}:9090`,
}

shadeInjector.useOdata({
  serviceEndpoint: PathHelper.joinPaths(environmentOptions.serviceUrl, 'odata'),
  defaultInit: {
    credentials: 'include',
    mode: 'no-cors',
  },
})

const motors = shadeInjector.getInstance(Motors)
const servos = shadeInjector.getInstance(Servos)

motors.stopAll().then(resp => console.log('Motors stopped', resp))
servos.setValues([
  { id: 0, value: 45 },
  { id: 1, value: 0 },
])

shadeInjector.useLogging(VerboseConsoleLogger)

shadeInjector.useGoogleAuth({
  clientId: '626364599424-47aut7jidipmngkt4r7inda1erl8ckqg.apps.googleusercontent.com',
})

shadeInjector.logger.withScope('Startup').verbose({
  message: 'Initializing Shade Frontend...',
  data: { environmentOptions },
})

const rootElement: HTMLDivElement = document.getElementById('root') as HTMLDivElement
initializeShadeRoot({
  rootElement,
  injector: shadeInjector,
  jsxElement: <Layout />,
})
