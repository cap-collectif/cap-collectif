// @ts-nocheck
import * as React from 'react'
import { MenuButton as ReakitMenuButton } from 'reakit/Menu'
import { useMenu } from './Menu.context'

const MenuButton = React.forwardRef<HTMLButtonElement, any>((props, ref) => {
  const buttonProps = { ...props.children.props, as: props.children.type, children: props.children.props.children }
  const { reakitMenu } = useMenu()
  return <ReakitMenuButton ref={ref} {...reakitMenu} {...buttonProps} />
})
MenuButton.displayName = 'Menu.Button'
export default MenuButton
