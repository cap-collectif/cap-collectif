// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import { graphql, useLazyLoadQuery } from 'react-relay'

const UserAvatar = lazy(
  () =>
    import(
      /* webpackChunkName: "UserAvatar" */
      '~/components/User/UserAvatar'
    ),
)

const QUERY = graphql`
  query UserAvatarAppQuery($userId: ID!) {
    node(id: $userId) {
      ... on User {
        ...UserAvatar_user
      }
    }
  }
`

const Query = ({ userId, size }) => {
  const data = useLazyLoadQuery(QUERY, { userId })
  return <UserAvatar user={data.node} size={size} />
}

export default props => (
  <Providers designSystem>
    <Suspense fallback={null}>
      <Query {...props} />
    </Suspense>
  </Providers>
)
