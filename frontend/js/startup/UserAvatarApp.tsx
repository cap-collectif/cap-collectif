// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import { graphql, useLazyLoadQuery } from 'react-relay'

const UserAvatar = lazy(() =>
  import(
    /* webpackChunkName: "UserAvatar" */
    '~/components/User/UserAvatar'
  ),
)

const QUERY = graphql`
  query UserAvatarAppQuery($userId: ID!) {
    node(id: $userId) {
      ...UserAvatar_user
    }
  }
`

const Query = ({ userId, size }) => {
  const data = useLazyLoadQuery(QUERY, { userId })
  return <UserAvatar user={data.node} size={size} displayUrl={false} />
}

export default props => (
  <Providers designSystem>
    <Suspense fallback={null}>
      {props.userId ? <Query {...props} /> : <UserAvatar user={null} size={props.size} />}
    </Suspense>
  </Providers>
)
