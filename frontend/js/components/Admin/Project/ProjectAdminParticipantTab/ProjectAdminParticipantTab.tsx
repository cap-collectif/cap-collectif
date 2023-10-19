import * as React from 'react'
import isEqual from 'lodash/isEqual'
import { graphql, usePreloadedQuery, useQuery } from 'relay-hooks'
import { useSelector } from 'react-redux'
import type { ResultPreloadQuery, Query, GlobalState } from '~/types'
import type {
  ProjectAdminParticipantTabQueryResponse,
  ProjectAdminParticipantTabQueryVariables,
} from '~relay/ProjectAdminParticipantTabQuery.graphql'
import type { ProjectAdminParticipantParameters } from './ProjectAdminParticipant.reducer'
import ProjectAdminParticipants, {
  PROJECT_ADMIN_PARTICIPANT_PAGINATION,
} from '~/components/Admin/Project/ProjectAdminParticipantTab/ProjectAdminParticipants/ProjectAdminParticipants'
import { useProjectAdminParticipantsContext } from './ProjectAdminParticipant.context'
import PickableList from '~ui/List/PickableList'
import ProjectAdminParticipantsPlaceholder from './ProjectAdminParticipantsPlaceholder'
import Skeleton from '~ds/Skeleton'
type Props = {
  readonly projectId: string
  readonly dataPrefetch: ResultPreloadQuery
}
type PropsQuery = Query & {
  props: ProjectAdminParticipantTabQueryResponse
}

const createQueryVariables = (
  projectId: string,
  parameters: ProjectAdminParticipantParameters,
  viewerIsAdmin: boolean,
): ProjectAdminParticipantTabQueryVariables => ({
  projectId,
  count: PROJECT_ADMIN_PARTICIPANT_PAGINATION,
  viewerIsAdmin,
  cursor: null,
  orderBy: {
    field: 'ACTIVITY',
    direction: parameters.sort === 'newest' ? 'DESC' : 'ASC',
  },
  term: parameters.filters.term,
  userType: parameters.filters.type === 'ALL' ? null : parameters.filters.type,
  step: parameters.filters.step === 'ALL' ? null : parameters.filters.step,
  contribuableId: parameters.filters.step === 'ALL' ? projectId : parameters.filters.step,
})

export const queryParticipant = graphql`
  query ProjectAdminParticipantTabQuery(
    $projectId: ID!
    $count: Int!
    $cursor: String
    $orderBy: UserOrder!
    $term: String
    $userType: ID
    $step: ID
    $contribuableId: ID
    $viewerIsAdmin: Boolean!
  ) {
    project: node(id: $projectId) {
      ...ProjectAdminParticipants_project
        @arguments(
          projectId: $projectId
          viewerIsAdmin: $viewerIsAdmin
          count: $count
          cursor: $cursor
          orderBy: $orderBy
          term: $term
          userType: $userType
          step: $step
          contribuableId: $contribuableId
        )
    }
    viewer {
      ...ProjectAdminParticipants_viewer
    }
  }
`
export const initialVariables = (projectId: string, viewerIsAdmin: boolean = false) => ({
  count: PROJECT_ADMIN_PARTICIPANT_PAGINATION,
  cursor: null,
  viewerIsAdmin,
  orderBy: {
    field: 'ACTIVITY',
    direction: 'DESC',
  },
  term: null,
  userType: null,
  step: null,
  contribuableId: projectId,
})

const ProjectAdminParticipantTab = ({ projectId, dataPrefetch }: Props) => {
  const { parameters } = useProjectAdminParticipantsContext()
  const { user } = useSelector((state: GlobalState) => state.user)
  const viewerIsAdmin = user ? user.isAdmin : false
  const { props: dataPreloaded } = usePreloadedQuery(dataPrefetch)
  const queryVariablesWithParameters = createQueryVariables(projectId, parameters, viewerIsAdmin)
  const hasFilters: boolean = !isEqual(
    {
      projectId,
      ...initialVariables(projectId, viewerIsAdmin),
    },
    queryVariablesWithParameters,
  )
  const {
    props: data,
    error,
    retry,
  }: PropsQuery = useQuery(queryParticipant, queryVariablesWithParameters, {
    skip: !hasFilters,
  })
  return (
    <Skeleton
      isLoaded={(!hasFilters && !!dataPreloaded && !!dataPreloaded.project) || (hasFilters && !!data && !!data.project)}
      placeholder={<ProjectAdminParticipantsPlaceholder hasError={!!error} fetchData={retry} />}
    >
      <PickableList.Provider>
        <ProjectAdminParticipants
          project={dataPreloaded && !hasFilters ? dataPreloaded.project : data?.project}
          viewer={dataPreloaded?.viewer ?? data?.viewer}
        />
      </PickableList.Provider>
    </Skeleton>
  )
}

export default ProjectAdminParticipantTab
