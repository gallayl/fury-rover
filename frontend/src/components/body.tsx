import { SessionService, sessionState } from '../services/session'
import { User } from 'common'
import { Init, FirstPersonView, Offline, Login } from '../pages'
import { createComponent, Shade, Router } from '@furystack/shades'

export const Body = Shade({
  shadowDomName: 'shade-app-body',
  initialState: {
    sessionState: 'initial' as sessionState,
    currentUser: null as User | null,
  },
  constructed: async ({ injector, updateState }) => {
    const session = injector.getInstance(SessionService)
    const observables = [
      session.state.subscribe(newState =>
        updateState({
          sessionState: newState,
        }),
      ),
      session.currentUser.subscribe(usr => updateState({ currentUser: usr })),
    ]
    return () => observables.forEach(o => o.dispose())
  },
  render: ({ getState }) => {
    return (
      <div
        id="Body"
        style={{
          margin: '10px',
          padding: '10px',
          position: 'fixed',
          top: '40px',
          width: 'calc(100% - 40px)',
          height: 'calc(100% - 80px)',
          overflow: 'hidden',
        }}>
        {(() => {
          switch (getState().sessionState) {
            case 'authenticated':
              return (
                <Router
                  routeMatcher={(current, component) => current.pathname === component}
                  notFound={() => <div>Route not found</div>}
                  routes={[{ url: '/', component: () => <FirstPersonView /> }]}></Router>
              )
            case 'offline':
              return <Offline />
            case 'unauthenticated':
              return (
                <Router
                  routeMatcher={(current, component) => current.pathname === component}
                  notFound={() => <div>Route not found</div>}
                  routes={[{ url: '/', component: () => <Login /> }]}
                />
              )
            default:
              return <Init />
          }
        })()}
      </div>
    )
  },
})
