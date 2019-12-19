import { Shade, createComponent, PartialElement } from '@furystack/shades'

export const Paper = Shade<PartialElement<HTMLDivElement>>({
  shadowDomName: 'shade-paper',
  render: ({ props, children }) => {
    return (
      <div
        {...props}
        style={{
          borderRadius: '3px',
          boxShadow: '1px 1px 3px rgba(0,0,0,0.3)',
          backgroundColor: 'rgba(255,255,255,0.4)',
          ...(props ? props.style : {}),
        }}>
        {children}
      </div>
    )
  },
})
