/* eslint-env jest */

import '../../../_setupES'

const UserDebateArgumentsQuery = /* GraphQL */ `
  query UserDebateArgumentsQuery($userId: ID!, $orderBy: DebateArgumentOrder) {
    user: node(id: $userId) {
      ... on User {
        debateArguments(orderBy: $orderBy) {
          totalCount
          edges {
            node {
              id
              votes {
                totalCount
              }
            }
          }
        }
      }
    }
  }
`

const userId = toGlobalId('User', 'userTheo')

describe('Internal|User.debateArguments visibility', () => {
  it('returns published debate arguments to an anonymous user', async () => {
    await expect(graphql(UserDebateArgumentsQuery, { userId, orderBy: null }, 'internal')).resolves.toMatchSnapshot()
  })

  it('orders debate arguments by lower popularity', async () => {
    await expect(
      graphql(UserDebateArgumentsQuery, { userId, orderBy: { field: 'VOTE_COUNT', direction: 'ASC' } }, 'internal'),
    ).resolves.toMatchSnapshot()
  })
})
