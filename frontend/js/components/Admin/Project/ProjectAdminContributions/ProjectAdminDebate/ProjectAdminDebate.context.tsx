import * as React from 'react'
import type {
  Filters,
  Action,
  ProjectAdminDebateParameters,
  ProjectAdminDebateState,
} from './ProjectAdminDebate.reducer'
import { createReducer } from './ProjectAdminDebate.reducer'
type ProviderProps = {
  readonly children: JSX.Element | JSX.Element[] | string
}
export type Context = {
  readonly parameters: ProjectAdminDebateParameters
  readonly dispatch: (arg0: Action) => void
}
export const DEFAULT_FILTERS: Filters = {
  argument: {
    type: ['FOR', 'AGAINST'],
    state: 'PUBLISHED',
  },
  vote: {
    state: 'ALL',
  },
}
export const ProjectAdminDebateContext = React.createContext<Context>({
  parameters: {
    filters: DEFAULT_FILTERS,
  },
  dispatch: () => {},
})
export const useProjectAdminDebateContext = (): Context => {
  const context = React.useContext(ProjectAdminDebateContext)

  if (!context) {
    throw new Error(`You can't use the ProjectAdminDebateContext outside a ProjectAdminDebateProvider component.`)
  }

  return context
}
export const ProjectAdminDebateProvider = ({ children }: ProviderProps) => {
  const [state, dispatch] = React.useReducer<ProjectAdminDebateState, Action>(createReducer, {
    filters: DEFAULT_FILTERS,
  })
  const context = React.useMemo(
    () => ({
      parameters: {
        filters: state.filters,
      },
      dispatch,
    }),
    [state],
  )
  return <ProjectAdminDebateContext.Provider value={context}>{children}</ProjectAdminDebateContext.Provider>
}
