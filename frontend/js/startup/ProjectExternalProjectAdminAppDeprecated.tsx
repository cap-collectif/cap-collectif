// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import { graphql, QueryRenderer } from 'react-relay'
import Providers from './Providers'
import environment, { graphqlError } from '../createRelayEnvironment'
import type { ProjectExternalProjectAdminAppDeprecatedQueryResponse } from '~relay/ProjectExternalProjectAdminAppDeprecatedQuery.graphql'
import Loader from '~ui/FeedbacksIndicators/Loader'

const ProjectExternalProjectAdminPageDeprecated = lazy(
  () =>
    import(
      /* webpackChunkName: "ProjectExternalProjectAdminPageDeprecated" */
      '~/components/Admin/Project/External/ProjectExternalProjectAdminPageDeprecated'
    ),
)

const ProjectExternalProjectAdminAppDeprecated = ({
  projectId,
  hostUrl,
}: {
  projectId: string | null | undefined
  hostUrl: string
}) => {
  return (
    <Suspense fallback={<Loader />}>
      <Providers>
        {projectId ? (
          <QueryRenderer
            environment={environment}
            query={graphql`
              query ProjectExternalProjectAdminAppDeprecatedQuery($projectId: ID!) {
                project: node(id: $projectId) {
                  ...ProjectExternalAdminFormDeprecated_project
                }
              }
            `}
            variables={{
              projectId,
            }}
            render={({
              props,
              error,
            }: ReactRelayReadyState & {
              props: ProjectExternalProjectAdminAppDeprecatedQueryResponse | null | undefined
            }) => {
              if (error) {
                return graphqlError
              }

              if (props) {
                return <ProjectExternalProjectAdminPageDeprecated project={props.project} hostUrl={hostUrl} />
              }

              return null
            }}
          />
        ) : (
          <ProjectExternalProjectAdminPageDeprecated project={null} />
        )}
      </Providers>
    </Suspense>
  )
}

export default ProjectExternalProjectAdminAppDeprecated
