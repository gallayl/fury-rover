import { AppBar } from './common'
import { createComponent, RouteLink, Shade } from '@furystack/shades'

export interface HeaderProps {
  title: string
  links: Array<{ name: string; url: string }>
}

const urlStyle: Partial<CSSStyleDeclaration> = {
  color: '#aaa',
  textDecoration: 'none',
}

export const Header = Shade<HeaderProps>({
  shadowDomName: 'shade-app-header',
  render: ({ props, children }) => {
    return (
      <AppBar>
        <h3 style={{ margin: '0 2em 0 0', cursor: 'pointer' }}>
          <RouteLink title={props.title} href="/" style={urlStyle}>
            {props.title}
          </RouteLink>
        </h3>
        {props.links.map((link) => (
          <RouteLink title={link.name} href={link.url} style={{ ...urlStyle, padding: '0 8px', cursor: 'pointer' }}>
            {link.name || ''}
          </RouteLink>
        ))}
        {children}
      </AppBar>
    )
  },
})
