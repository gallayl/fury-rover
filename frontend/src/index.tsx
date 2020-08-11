/** ToDo: Main entry point */
import { Layout } from './components/layout'
import { Injector } from '@furystack/inject'
import { PathHelper } from '@furystack/utils'
import { createComponent, initializeShadeRoot } from '@furystack/shades'
import { VerboseConsoleLogger } from '@furystack/logging'
import './services/google-auth-provider'
import { RestClient } from './services/rest-client'

const shadeInjector = new Injector()

export const environmentOptions = {
  nodeEnv: process.env.NODE_ENV as 'development' | 'production',
  debug: Boolean(process.env.DEBUG),
  appVersion: process.env.APP_VERSION as string,
  buildDate: new Date(process.env.BUILD_DATE as string),
  serviceUrl: location.origin,
}

const rest = shadeInjector.getInstance(RestClient)
rest
  .call({
    method: 'POST',
    action: '/motors/stopAll',
  })
  .then((resp) => console.log('Motors stopped', resp))

rest.call({
  method: 'POST',
  action: '/servos/setValues',
  body: [
    { id: 0, value: 45 },
    { id: 1, value: 0 },
  ],
})

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
