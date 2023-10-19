// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import Providers from './Providers'
import environment, { graphqlError } from '../createRelayEnvironment'
import type { ArgumentListAppQueryResponse } from '~relay/ArgumentListAppQuery.graphql'
import Loader from '../components/Ui/FeedbacksIndicators/Loader'

const ArgumentListProfile = lazy(
  () =>
    import(
      /* webpackChunkName: "ArgumentListProfile" */
      '~/components/Argument/ArgumentListProfile'
    ),
)
const DebateArgumentListProfile = lazy(
  () =>
    import(
      /* webpackChunkName: "DebateArgumentListProfile" */
      '~/components/Argument/DebateArgumentListProfile'
    ),
)
export default ({ userId, isAuthenticated }: { userId: string; isAuthenticated: boolean }) => (
  <Suspense fallback={<Loader />}>
    <Providers designSystem>
      <QueryRenderer
        variables={{
          userId,
          count: 5,
          isAuthenticated,
        }}
        environment={environment}
        query={graphql`
          query ArgumentListAppQuery($userId: ID!, $count: Int!, $cursor: String, $isAuthenticated: Boolean!) {
            node(id: $userId) {
              ...ArgumentListProfile_argumentList
                @arguments(count: $count, cursor: $cursor, isAuthenticated: $isAuthenticated)
              ...DebateArgumentListProfile_debateArgumentList
                @arguments(count: $count, cursor: $cursor, isAuthenticated: $isAuthenticated)
            }
          }
        `}
        render={({
          error,
          props,
        }: ReactRelayReadyState & {
          props: ArgumentListAppQueryResponse | null | undefined
        }) => {
          if (error) {
            return graphqlError
          }

          if (props && props.node) {
            return (
              <>
                <ArgumentListProfile argumentList={props.node} />
                <DebateArgumentListProfile debateArgumentList={props.node} />
              </>
            )
          }

          return <Loader />
        }}
      />
    </Providers>
  </Suspense>
)
