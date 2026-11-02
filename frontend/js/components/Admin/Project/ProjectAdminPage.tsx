import React from 'react'
import { graphql, QueryRenderer } from 'react-relay'
import environment, { graphqlError } from '~/createRelayEnvironment'
import ProjectAdminContent from './ProjectAdminContent'
// @ts-ignore
import type { ProjectAdminPageQueryResponse } from '~relay/ProjectAdminPageQuery.graphql'
type Props = {
  readonly projectId: string | null | undefined
  readonly firstCollectStepId: string | null | undefined
}
export const ProjectAdminPage = ({ projectId, firstCollectStepId }: Props) => {
  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query ProjectAdminPageQuery($projectId: ID!, $isEditMode: Boolean!) {
          project: node(id: $projectId) @include(if: $isEditMode) {
            ...ProjectAdminContent_project
          }
        }
      `}
      variables={{
        projectId: projectId || '',
        isEditMode: !!projectId,
      }}
      render={({
        props,
        error,
      }: ReactRelayReadyState & {
        props: ProjectAdminPageQueryResponse | null | undefined
      }) => {
        if (error) {
          return graphqlError
        }

        if (props) {
          return (
            <ProjectAdminContent
              project={props.project || null}
              firstCollectStepId={firstCollectStepId}
            />
          )
        }

        return null
      }}
    />
  )
}
export default ProjectAdminPage
