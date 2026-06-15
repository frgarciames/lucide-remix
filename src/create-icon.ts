import type { IconNode } from 'lucide'
import { createElement, type Handle, type Props } from 'remix/ui'

export type IconProps = Props<'svg'>

export function renderSvgIcon(icon: IconNode, props?: IconProps) {
  return createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '1em',
      height: '1em',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 2,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': 'true',
      ...props,
    },
    ...icon.map(([tag, attrs], index) => createElement(tag, { ...attrs, key: index })),
  )
}

export function createIcon(icon: IconNode) {
  return function Icon(handle: Handle<IconProps>) {
    return () => renderSvgIcon(icon, handle.props)
  }
}
