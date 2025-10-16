// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import Providers from './Providers'
import environment, { graphqlError } from '../createRelayEnvironment'
import type {
  ProposalsUserVotesPageAppQueryResponse,
  ProposalsUserVotesPageAppQueryVariables,
} from '~relay/ProposalsUserVotesPageAppQuery.graphql'
import Loader from '~ui/FeedbacksIndicators/Loader'
import CookieMonster from '@shared/utils/CookieMonster'
const ProposalsUserVotesPage = lazy(
  () =>
    import(
      /* webpackChunkName: "ProposalsUserVotesPage" */
      '~/components/Project/Votes/ProposalsUserVotesPage'
    ),
)
export default (data: { projectId: string }) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px'
  const token = CookieMonster.getParticipantCookie()
  return (
    <Suspense fallback={<Loader />}>
      <Providers resetCSS={false} designSystem>
        <QueryRenderer
          variables={
            {
              project: data.projectId,
              isAuthenticated: !token,
              token,
            } as ProposalsUserVotesPageAppQueryVariables
          }
          environment={environment}
          query={graphql`
            query ProposalsUserVotesPageAppQuery($project: ID!, $token: String) {
              project: node(id: $project) {
                ...ProposalsUserVotesPage_project @arguments(token: $token)
              }
            }
          `}
          render={({
            error,
            props,
          }: ReactRelayReadyState & {
            props: ProposalsUserVotesPageAppQueryResponse | null | undefined
          }) => {
            if (error) {
              return graphqlError
            }

            if (props) {
              if (props.project) {
                return <ProposalsUserVotesPage project={props.project} />
              }

              return graphqlError
            }

            return null
          }}
        />
      </Providers>
    </Suspense>
  )
}
