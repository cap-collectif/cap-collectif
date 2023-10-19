import * as React from 'react'
export const cleanChildren = (children?: JSX.Element | JSX.Element[] | string) => {
  if (!children) return []
  return React.Children.toArray(children).filter(child => React.isValidElement(child)) as any
}
