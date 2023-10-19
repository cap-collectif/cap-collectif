// @ts-nocheck
import * as React from 'react'
export type Context = {
  readonly value?: string | string[]
  readonly onChange?: (newValue: string | string[]) => void
  readonly type: 'checkbox' | 'radio'
}
export const ListOptionGroupContext = React.createContext<Context>({
  type: 'checkbox',
})
export const useListOptionGroup = (): Context => {
  const context = React.useContext(ListOptionGroupContext)

  if (!context) {
    throw new Error(`You can't use the ListOptionGroupContext outsides a ListOptionGroup component.`)
  }

  return context
}
