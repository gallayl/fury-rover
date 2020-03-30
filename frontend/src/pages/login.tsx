import { Button, Input } from '../components/common'
import { SessionService } from '../services/session'
import { Loader } from '../components/loader'
import { GoogleOauthProvider } from '../services/google-auth-provider'
import { Shade, createComponent, RouteLink } from '@furystack/shades'

export const Login = Shade({
  shadowDomName: 'shade-login',
  getInitialState: () => ({
    username: '',
    password: '',
    error: '',
    isOperationInProgress: true,
  }),
  constructed: ({ injector, updateState }) => {
    const sessionService = injector.getInstance(SessionService)
    const subscriptions = [
      sessionService.loginError.subscribe((error) => updateState({ error }), true),
      sessionService.isOperationInProgress.subscribe(
        (isOperationInProgress) => updateState({ isOperationInProgress }),
        true,
      ),
    ]
    return () => subscriptions.map((s) => s.dispose())
  },
  render: ({ injector, getState, updateState }) => {
    const { error, username, password } = getState()
    const sessinService = injector.getInstance(SessionService)

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 100px',
        }}>
        <div>
          <form
            style={{
              padding: '10px 30px',
            }}
            className="login-form"
            onsubmit={(ev) => {
              ev.preventDefault()
              const state = getState()
              sessinService.login(state.username, state.password)
            }}>
            <h2
              style={{
                color: '#444',
                fontWeight: 'lighter',
                textAlign: 'center',
              }}>
              It's good to see you!
            </h2>
            <Input
              labelTitle="Username"
              required
              disabled={getState().isOperationInProgress}
              placeholder="The user's login name"
              value={username}
              onchange={(ev) => {
                updateState(
                  {
                    username: (ev.target as HTMLInputElement).value,
                  },
                  true,
                )
              }}
              type="text"
            />
            <Input
              labelTitle="Password"
              required
              disabled={getState().isOperationInProgress}
              placeholder="The password for the user"
              value={password}
              type="password"
              onchange={(ev) => {
                updateState(
                  {
                    password: (ev.target as HTMLInputElement).value,
                  },
                  true,
                )
              }}
            />
            <div
              style={{
                padding: '1em 0',
              }}>
              {error ? <div style={{ color: 'red', fontSize: '12px' }}>{error}</div> : <div />}
              <Button style={{ width: '100%' }} disabled={getState().isOperationInProgress} type="submit">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                  Login
                  {getState().isOperationInProgress ? (
                    <Loader
                      style={{
                        width: '12px',
                        height: '12px',
                        position: 'absolute',
                        top: '-2px',
                      }}
                    />
                  ) : null}
                </div>
              </Button>
            </div>
            <p style={{ fontSize: '10px', textAlign: 'center' }}>You can also log in with</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                type="button"
                onclick={async () => {
                  try {
                    await injector.getInstance(GoogleOauthProvider).login()
                  } catch (e) {
                    updateState({ error: e.body.error })
                  }
                }}>
                Google
              </Button>
              <Button disabled style={{ margin: '0 .3em' }}>
                Facebook
              </Button>{' '}
              <Button disabled>GitHub</Button>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-evenly',
                fontSize: '10px',
                marginTop: '1em',
                textDecoration: 'underline',
              }}>
              <RouteLink href="/register">Sign up</RouteLink>
              <RouteLink href="/reset-password">Reset password</RouteLink>
              <RouteLink href="/contact">Contact</RouteLink>
              <RouteLink href="/docs">Docs</RouteLink>
            </div>
          </form>
        </div>
      </div>
    )
  },
})
