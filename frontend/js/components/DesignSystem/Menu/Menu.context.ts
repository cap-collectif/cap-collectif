// @ts-nocheck
import * as React from 'react'
export type Context = {
  readonly reakitMenu: any
  readonly hideOnClickOutside: boolean
  readonly closeOnSelect: boolean
}
export const MenuContext = React.createContext<Context | null | undefined>(undefined)
export const useMenu = (): Context => {
  const context = React.useContext(MenuContext)

  if (!context) {
    throw new Error(`You can't use the MenuContext outsides a Menu component.`)
  }

  return context
}
