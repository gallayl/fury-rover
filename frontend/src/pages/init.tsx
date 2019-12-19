import { Shade, createComponent } from '@furystack/shades'
import { Loader } from '../components/loader'

export const Init = Shade({
  shadowDomName: 'shade-init',
  render: () => (
    <div
      style={{
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <style>{`
      @keyframes show{
        0%{
          opacity: 0;
        }
      
        100%{
          opacity: 1
        }
      }

      .initLoader {
        opacity: 0;
        animation: show .6s cubic-bezier(0.550, 0.085, 0.680, 0.530) 1s normal  forwards ;
      }
      `}</style>
      <div
        className="initLoader"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Loader
          style={{
            width: '128px',
            height: '128px',
          }}
        />
        <h2>Initializing app...</h2>
      </div>
    </div>
  ),
})
