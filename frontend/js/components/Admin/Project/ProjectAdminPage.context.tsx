import * as React from 'react'
import { useEffect } from 'react'
import type { ProjectAdminPageParameters } from '~/components/Admin/Project/ProjectAdminPage.reducer'
import type { ProjectAdminPageStatus } from '~/components/Admin/Project/ProjectAdminPage.utils'
import type { Action, ProjectAdminPageState } from './ProjectAdminPage.reducer'
import {
  createReducer,
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  DEFAULT_STATUS,
  getInitialState,
} from './ProjectAdminPage.reducer'
type ProviderProps = {
  readonly children: JSX.Element | JSX.Element[] | string
  readonly firstCollectStepId: string | null | undefined
}
export type Context = {
  readonly status: ProjectAdminPageStatus
  readonly parameters: ProjectAdminPageParameters
  readonly firstCollectStepId: string | null | undefined
  readonly dispatch: (arg0: Action) => void
}
export const ProjectAdminPageContext = React.createContext<Context>({
  status: DEFAULT_STATUS,
  parameters: {
    sort: DEFAULT_SORT,
    filters: DEFAULT_FILTERS,
    filtersOrdered: [],
  },
  firstCollectStepId: null,
  dispatch: () => {},
})
export const useProjectAdminProposalsContext = (): Context => {
  const context = React.useContext(ProjectAdminPageContext)

  if (!context) {
    throw new Error(`You can't use the ProjectAdminPageContext outside a ProjectAdminPageProvider component.`)
  }

  return context
}
export const ProjectAdminProposalsProvider = ({ children, firstCollectStepId }: ProviderProps) => {
  const [state, dispatch] = React.useReducer<React.Reducer<ProjectAdminPageState, Action>>(
    createReducer,
    getInitialState(firstCollectStepId),
  )
  useEffect(() => {
    // @ts-ignore
    dispatch({
      type: 'INIT_FILTERS_FROM_URL',
    })
  }, [])
  const context = React.useMemo(
    () => ({
      // @ts-ignore
      status: state.status,
      parameters: {
        // @ts-ignore
        sort: state.sort,
        // @ts-ignore
        filters: state.filters,
        // @ts-ignore
        filtersOrdered: state.filtersOrdered,
      },
      firstCollectStepId,
      dispatch,
    }),
    [state, firstCollectStepId],
  )
  return <ProjectAdminPageContext.Provider value={context}>{children}</ProjectAdminPageContext.Provider>
}
