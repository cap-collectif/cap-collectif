import * as React from 'react'
import UserTypeCard from './UserTypeCard'
import { graphql, GraphQLTaggedNode, usePaginationFragment } from 'react-relay'
import { UserTypesList_query$data, UserTypesList_query$key } from '@relay/UserTypesList_query.graphql'

type Props = {
  queryReference: UserTypesList_query$key
  connectionId: string
}

const FRAGMENT: GraphQLTaggedNode = graphql`
  fragment UserTypesList_query on Query
  @refetchable(queryName: "UserTypesListPaginationQuery")
  @argumentDefinitions(first: { type: "Int" }, cursor: { type: "String" }) {
    userTypes(first: $first, after: $cursor) @connection(key: "UserTypesList_userTypes", filters: []) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      __id
      edges {
        node {
          id
          name
          translations {
            name
            locale
          }
          media {
            id
            name
            size
            type: contentType
            url(format: "reference")
          }
        }
      }
    }
  }
`

export const UserTypesList: React.FC<Props> = ({ queryReference, connectionId }) => {
  const { data } = usePaginationFragment(FRAGMENT, queryReference)

  const profileTypes: UserTypesList_query$data['userTypes']['edges'] = data.userTypes.edges

  return profileTypes.map(userType => {
    const currentUserType = userType?.node
    return currentUserType ? (
      <UserTypeCard key={currentUserType.id} type={currentUserType} connectionId={connectionId} />
    ) : null
  })
}

export default UserTypesList
