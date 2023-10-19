// @ts-nocheck
import * as React from 'react'
export type Context = {
  readonly open: boolean
  readonly toggleOpen: () => void
  readonly disabled?: boolean
}
export const AccordionItemContext = React.createContext<Context>({
  open: false,
  toggleOpen: () => undefined,
  disabled: false,
})
