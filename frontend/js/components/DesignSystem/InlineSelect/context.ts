// @ts-nocheck
import * as React from 'react'
export type Context = {
  readonly value?: string | null
  readonly onChange?: (value: string) => void
}
export const InlineSelectContext = React.createContext<Context>({
  value: null,
})
