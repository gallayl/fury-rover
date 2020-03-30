import { SessionService, sessionState } from '../services/session'
import { Init, FirstPersonView, Offline, Login } from '../pages'
import { createComponent, Shade, Router } from '@furystack/shades'
import { User } from '@furystack/core'

export const Body = Shade<any, { currentUser: User | null; sessionState: sessionState }>({
  shadowDomName: 'shade-app-body',
  getInitialState: ({ injector }) => {
    const session = injector.getInstance(SessionService)
    return {
      currentUser: session.currentUser.getValue(),
      sessionState: session.state.getValue(),
    }
  },
  constructed: async ({ injector, updateState }) => {
    const session = injector.getInstance(SessionService)
    const observables = [
      session.state.subscribe((newState) =>
        updateState({
          sessionState: newState,
        }),
      ),
      session.currentUser.subscribe((usr) => updateState({ currentUser: usr })),
    ]
    return () => observables.forEach((o) => o.dispose())
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
                  notFound={() => <div>Route not found</div>}
                  routes={[{ url: '/', component: () => <FirstPersonView /> }]}></Router>
              )
            case 'offline':
              return <Offline />
            case 'unauthenticated':
              return (
                <Router
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
