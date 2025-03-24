// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import Providers from './Providers'
import environment, { graphqlError } from '../createRelayEnvironment'
import { PROPOSAL_PAGINATION } from '~/components/User/Profile/UserProposalsPaginated'
import type {
  UserProposalsAppQueryResponse,
  UserProposalsAppQueryVariables,
} from '~relay/UserProposalsAppQuery.graphql'
import Loader from '~ui/FeedbacksIndicators/Loader'
const UserProposalsPaginated = lazy(
  () =>
    import(
      /* webpackChunkName: "UserProposalsPaginated" */
      '~/components/User/Profile/UserProposalsPaginated'
    ),
)
type Props = {
  authorId: string
  isAuthenticated: boolean
}
export default ({ authorId, isAuthenticated }: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers designSystem>
      <QueryRenderer
        variables={
          {
            authorId,
            isProfileView: true,
            isAuthenticated,
            // TODO fixme https://github.com/cap-collectif/platform/issues/7016
            stepId: '',
            count: PROPOSAL_PAGINATION,
            cursor: null,
          } as UserProposalsAppQueryVariables
        }
        environment={environment}
        query={graphql`
          query UserProposalsAppQuery(
            $stepId: ID!
            $authorId: ID!
            $isAuthenticated: Boolean!
            $count: Int!
            $isProfileView: Boolean!
            $cursor: String
          ) {
            user: node(id: $authorId) {
              id
              ...UserProposalsPaginated_user
                @arguments(
                  count: $count
                  isAuthenticated: $isAuthenticated
                  isProfileView: $isProfileView
                  stepId: $stepId
                  cursor: $cursor
                )
            }
          }
        `}
        render={({
          error,
          props,
        }: ReactRelayReadyState & {
          props: UserProposalsAppQueryResponse | null | undefined
        }) => {
          if (error) {
            return graphqlError
          }

          if (props) {
            if (props.user && props.user.id) {
              return <UserProposalsPaginated user={props.user} />
            }

            return graphqlError
          }

          return null
        }}
      />
    </Providers>
  </Suspense>
)
