import * as React from 'react'
import type { Action, MediaAdminListState } from './MediaAdminList.reducer'
import { createReducer } from './MediaAdminList.reducer'
import type { Filters, MediaAdminListParameters } from './MediaAdminList.reducer'
export type MediaAdminListStatus = 'ready' | 'loading'
type ProviderProps = {
  readonly children: JSX.Element | JSX.Element[] | string
}
export type Context = {
  readonly status: MediaAdminListStatus
  readonly parameters: MediaAdminListParameters
  readonly dispatch: (arg0: Action) => void
}
const DEFAULT_STATUS: MediaAdminListStatus = 'ready'
export const DEFAULT_FILTERS: Filters = {
  term: null,
}
export const MediaAdminListContext = React.createContext<Context>({
  status: DEFAULT_STATUS,
  parameters: {
    filters: DEFAULT_FILTERS,
  },
  dispatch: () => {},
})
export const useMediaAdminListContext = (): Context => {
  const context = React.useContext(MediaAdminListContext)

  if (!context) {
    throw new Error(`You can't use the MediaAdminListContext outside a MediaAdminListProvider component.`)
  }

  return context
}
export const MediaAdminListProvider = ({ children }: ProviderProps) => {
  const [state, dispatch] = React.useReducer<MediaAdminListState, Action>(createReducer, {
    status: DEFAULT_STATUS,
    filters: DEFAULT_FILTERS,
  })
  const context = React.useMemo(
    () => ({
      status: state.status,
      parameters: {
        filters: state.filters,
      },
      dispatch,
    }),
    [state],
  )
  return <MediaAdminListContext.Provider value={context}>{children}</MediaAdminListContext.Provider>
}
