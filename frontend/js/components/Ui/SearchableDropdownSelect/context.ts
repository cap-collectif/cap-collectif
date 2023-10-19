import * as React from 'react'
import type { Action, State } from './reducer'
export type Context = {
  readonly state: State
  readonly dispatch: (arg0: Action) => void
}
export const SearchableDropdownSelectContext = React.createContext<Context>({
  state: {
    results: [],
    error: null,
    status: 'default',
  },
  dispatch: () => {},
})
export const useSearchableDropdownSelectContext = (): Context => {
  const context = React.useContext(SearchableDropdownSelectContext)

  if (!context) {
    throw new Error(`You can't use the SearchableDropdownSelectContext outside a SearchableDropdownSelect component.`)
  }

  return context
}
