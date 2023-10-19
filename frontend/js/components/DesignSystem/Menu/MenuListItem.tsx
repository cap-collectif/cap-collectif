// @ts-nocheck
import * as React from 'react'
import { MenuItem } from 'reakit/Menu'
import styled from 'styled-components'
import { forwardRef, useCallback } from 'react'
import { themeGet } from '@styled-system/theme-get'
import type { ButtonProps } from '~ds/Button/Button'
import { useMenu } from '~ds/Menu/Menu.context'
import Text from '~ui/Primitives/Text'
import colors from '~/styles/modules/colors'
const MenuItemInner = styled(MenuItem)`
  width: 100%;
  pointer-events: all;
  display: flex;
  background: transparent;
  border: none;
  padding: ${themeGet('space.2')} ${themeGet('space.3')};
  align-items: center;
  border-bottom: ${themeGet('borders.normal')};
  line-height: ${themeGet('lineHeights.base')};
  border-bottom-color: ${themeGet('colors.gray.150')};
  &:active,
  &:focus {
    outline: none;
    background: ${themeGet('colors.gray.100')};
  }
  &:hover {
    cursor: pointer;
  }
  &:last-of-type {
    border-bottom: none;
  }
  &[disabled] {
    pointer-events: none;
    color: ${props => themeGet(`colors.${props.color}`, colors.gray['500'])(props)};
  }
`
export type Props = ButtonProps & {
  readonly closeOnSelect?: boolean
  readonly disabled?: boolean
  readonly children: JSX.Element | JSX.Element[] | string
}
const MenuListItem = forwardRef<HTMLElement, Props>(({ disabled, children, onClick, closeOnSelect, ...props }, ref) => {
  const { reakitMenu, closeOnSelect: menuCloseOnSelect } = useMenu()
  const onClickHandler = useCallback<MouseEventHandler>(
    e => {
      if (onClick) {
        onClick(e)
      }

      const shouldHide = (() => {
        if (closeOnSelect !== undefined && closeOnSelect) {
          return true
        }

        if (closeOnSelect !== undefined && !closeOnSelect) {
          return false
        }

        return menuCloseOnSelect && !closeOnSelect
      })()

      if (shouldHide) {
        reakitMenu.hide()
      }
    },
    [closeOnSelect, menuCloseOnSelect, onClick, reakitMenu],
  )
  return (
    <MenuItemInner disabled={disabled} ref={ref} onClick={onClickHandler} {...reakitMenu} {...props}>
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </MenuItemInner>
  )
})
MenuListItem.displayName = 'Menu.ListItem'
export default MenuListItem
