/* eslint-env jest */
import '../../../_setupES'

const UserArgumentsVisibilityQuery = /* GraphQL */ `
  query UserArgumentsVisibilityQuery($userId: ID!) {
    user: node(id: $userId) {
      ... on User {
        arguments {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`

const userId = toGlobalId('User', 'userAdmin')

describe('Internal|User.arguments visibility', () => {
  it('returns visible arguments to an admin', async () => {
    await expect(graphql(UserArgumentsVisibilityQuery, { userId }, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('returns all arguments to a super admin', async () => {
    await expect(graphql(UserArgumentsVisibilityQuery, { userId }, 'internal_sfavot')).resolves.toMatchSnapshot()
  })

  it('returns visible arguments to an anonymous user', async () => {
    await expect(graphql(UserArgumentsVisibilityQuery, { userId }, 'internal')).resolves.toMatchSnapshot()
  })
})
