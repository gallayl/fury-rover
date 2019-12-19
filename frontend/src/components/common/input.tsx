import { Shade, PartialElement, createComponent } from '@furystack/shades'

export interface InputProps extends PartialElement<HTMLInputElement> {
  labelTitle?: string
}

export const Input = Shade<InputProps>({
  shadowDomName: 'shade-input',
  render: ({ props, element }) => {
    return (
      <label
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#999',
          marginBottom: '1em',
          padding: '1em',
          borderRadius: '5px',
          transition:
            'background-color 300ms cubic-bezier(0.455, 0.030, 0.515, 0.955), box-shadow 300ms cubic-bezier(0.455, 0.030, 0.515, 0.955)',
        }}>
        {props.labelTitle}
        <input
          onfocus={() => {
            ;(element.querySelector('label') as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.2)'
            ;(element.querySelector('label') as HTMLElement).style.boxShadow = '0px 0px 5px rgba(0,0,0,.1)'
          }}
          onblur={() => {
            ;(element.querySelector('label') as HTMLElement).style.backgroundColor = 'transparent'
            ;(element.querySelector('label') as HTMLElement).style.boxShadow = 'none'
          }}
          {...props}
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            outline: 'none',
            fontSize: '12px',
            ...props.style,
          }}
        />
      </label>
    )
  },
})
