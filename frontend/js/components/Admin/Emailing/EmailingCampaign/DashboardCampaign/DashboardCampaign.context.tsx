import * as React from 'react'
import { useEffect } from 'react'
import type { Action, DashboardState } from './DashboardCampaign.reducer'
import {
  createReducer,
  DEFAULT_FILTERS,
  getInitialState,
  DEFAULT_STATUS,
  DEFAULT_SORT,
} from './DashboardCampaign.reducer'
import type { DashboardParameters } from './DashboardCampaign.reducer'
export type DashboardStatus = 'ready' | 'loading'
type ProviderProps = {
  readonly children: JSX.Element | JSX.Element[] | string
}
export type Context = {
  readonly status: DashboardStatus
  readonly parameters: DashboardParameters
  readonly dispatch: (arg0: Action) => void
}
export const DashboardCampaignContext = React.createContext<Context>({
  status: DEFAULT_STATUS,
  parameters: {
    sort: DEFAULT_SORT,
    filters: DEFAULT_FILTERS,
  },
  dispatch: () => {},
})
export const useDashboardCampaignContext = (): Context => {
  const context = React.useContext(DashboardCampaignContext)

  if (!context) {
    throw new Error(`You can't use the DashboardCampaignContext outside a DashboardCampaignProvider component.`)
  }

  return context
}
export const DashboardCampaignProvider = ({ children }: ProviderProps) => {
  const [state, dispatch] = React.useReducer<DashboardState, Action>(createReducer, getInitialState())
  useEffect(() => {
    dispatch({
      type: 'INIT_FILTERS_FROM_URL',
    })
  }, [])
  const context = React.useMemo(
    () => ({
      status: state.status,
      parameters: {
        sort: state.sort,
        filters: state.filters,
      },
      dispatch,
    }),
    [state],
  )
  return <DashboardCampaignContext.Provider value={context}>{children}</DashboardCampaignContext.Provider>
}
