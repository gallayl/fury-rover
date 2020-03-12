import { NippleComponent } from '../components/nipple'
import { RestClient } from '../services/rest-client'
import { Shade, createComponent } from '@furystack/shades'
import { JoystickOutputData } from 'nipplejs'
import Semaphore from 'semaphore-async-await'

export interface FirstPersonViewState {
  data?: JoystickOutputData
  lastSentData?: JoystickOutputData
  sensitivity: number
}

const VECTOR_MULTIPLIER = 0.3
const UPDATE_TIMEOUT = 100

const updateLock = new Semaphore(1)

export const FirstPersonView = Shade<any, FirstPersonViewState>({
  shadowDomName: 'shade-first-person-view',
  initialState: {
    sensitivity: VECTOR_MULTIPLIER,
  },
  constructed: ({ getState, updateState, injector }) => {
    const interval = setInterval(async () => {
      const currentState = getState()
      if (
        !currentState.lastSentData ||
        (currentState.data &&
          JSON.stringify(currentState.lastSentData.vector) !== JSON.stringify(currentState.data.vector))
      ) {
        if (currentState.data && updateLock.getPermits()) {
          try {
            await updateLock.acquire()
            const throttle = currentState.data.vector.y * VECTOR_MULTIPLIER * currentState.data.force
            const steer = Math.round(90 + 90 * Math.cos(currentState.data.angle.radian))
            updateState({ lastSentData: currentState.data }, true)
            injector.getInstance(RestClient).call({
              method: 'POST',
              action: '/move',
              body: {
                frontLeft: throttle,
                backLeft: throttle,
                frontRight: throttle,
                backRight: throttle,
                steer,
              },
            })
          } finally {
            updateLock.release()
          }
        }
      }
    }, UPDATE_TIMEOUT)
    return () => {
      clearInterval(interval)
    }
  },
  render: ({ getState, updateState, injector }) => {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
        }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            border: '1px solid black',
            display: 'flex',
            flexDirection: 'column',
          }}>
          <div style={{ border: '1px solid red', height: '48px' }}>
            <input
              type="range"
              min="0"
              max="90"
              value="45"
              style={{
                width: '100%',
                height: '100%',
              }}
              onchange={ev => {
                const { value } = ev.currentTarget as HTMLInputElement
                if (value && !isNaN(value as any))
                  injector.getInstance(RestClient).call({
                    method: 'POST',
                    action: '/servos/setValues',
                    body: [{ id: 0, value: parseInt(value, 10) }],
                  })
              }}
            />
          </div>
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexGrow: '1',
              border: '1px solid green',
            }}>
            <NippleComponent
              style={{ flexGrow: '1', height: '100%', width: '100%', position: 'relative' }}
              managerOptions={{
                size: 500,
              }}
              onMove={(_e, data) => {
                updateState({ data }, true)
              }}
              onEnd={() => {
                injector.getInstance(RestClient).call({ method: 'POST', action: '/motors/stopAll' })
                const newData = { ...getState().data, vector: { x: 0, y: 0 } }
                updateState({ data: newData }, true)
              }}>
              <img
                src="/"
                alt="fpvScreen"
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(rgba(0,0,0,0.5), transparent 50%)',
                  display: 'block',
                  objectFit: 'contain',
                }}
              />
            </NippleComponent>
            <div
              onclick={ev => {
                ev.preventDefault()
                ev.stopPropagation()
              }}
              onmousemove={ev => {
                ev.preventDefault()
                ev.stopPropagation()
              }}
              style={{
                height: '100%',
                width: '48px',
                border: '1px solid cyan',
              }}>
              <input
                type="range"
                min="0"
                max="160"
                value="0"
                style={
                  {
                    '-webkit-appearance': 'slider-vertical',
                    width: '100%',
                    height: '100%',
                  } as any
                }
                onchange={ev => {
                  const { value } = ev.currentTarget as HTMLInputElement
                  if (value && !isNaN(value as any))
                    injector.getInstance(RestClient).call({
                      method: 'POST',
                      action: '/servos/setValues',
                      body: [{ id: 1, value: parseInt(value, 10) }],
                    })
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  },
})
