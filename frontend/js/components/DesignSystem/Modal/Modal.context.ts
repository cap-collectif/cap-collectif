// @ts-nocheck
import * as React from 'react'
export type Context = {
  readonly hide: () => void
  readonly show: () => void
  readonly toggle: () => void
  readonly hideCloseButton?: boolean
  readonly visible: boolean
  readonly fullPageScrollable?: boolean
}
export const ModalContext = React.createContext<Context>({
  hide: () => {},
  show: () => {},
  toggle: () => {},
  visible: false,
  hideCloseButton: false,
  fullPageScrollable: false,
})
export const useModal = (): Context => {
  const context = React.useContext(ModalContext)

  if (!context) {
    throw new Error(`You can't use the ModalContext outsides a Modal component.`)
  }

  return context
}
