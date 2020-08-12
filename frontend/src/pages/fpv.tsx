import { NippleComponent } from '../components/nipple'
import { RestClient } from '../services/rest-client'
import { Shade, createComponent } from '@furystack/shades'
import { MovementService } from '../services/movement-service'

export const FirstPersonView = Shade<any>({
  shadowDomName: 'shade-first-person-view',
  render: ({ injector }) => {
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
              max="100"
              value="50"
              style={{
                width: '100%',
                height: '100%',
              }}
              onchange={(ev) => {
                const { value } = ev.currentTarget as HTMLInputElement
                if (value && !isNaN(value as any))
                  injector.getInstance(RestClient).call({
                    method: 'POST',
                    action: '/servos/setValues',
                    body: [{ servo: 'yaw', percent: parseInt(value, 10) }],
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
                const throttle = data.vector.y * data.force
                const steer = Math.max(0, Math.min(100, Math.round(50 + 50 * Math.cos(data.angle.radian))))
                injector.getInstance(MovementService).move({ throttle, steerPercent: steer })
              }}
              onEnd={() => {
                injector.getInstance(MovementService).release()
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
              onclick={(ev) => {
                ev.preventDefault()
                ev.stopPropagation()
              }}
              onmousemove={(ev) => {
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
                max="100"
                value="50"
                style={
                  {
                    '-webkit-appearance': 'slider-vertical',
                    width: '100%',
                    height: '100%',
                  } as any
                }
                onchange={(ev) => {
                  const { value } = ev.currentTarget as HTMLInputElement
                  if (value && !isNaN(value as any))
                    injector.getInstance(RestClient).call({
                      method: 'POST',
                      action: '/servos/setValues',
                      body: [{ servo: 'pitch', percent: parseInt(value, 10) }],
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
