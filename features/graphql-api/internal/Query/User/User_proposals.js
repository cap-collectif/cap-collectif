/* eslint-env jest */
import '../../../_setupES'

const UserProposalsVisibilityQuery = /* GraphQL */ `
  query UserProposalsVisibilityQuery($userId: ID!, $after: String) {
    user: node(id: $userId) {
      ... on User {
        proposals(after: $after, first: 5) {
          edges {
            node {
              project {
                title
                _id
                visibility
              }
              title
            }
          }
        }
      }
    }
  }
`

const userAdminId = toGlobalId('User', 'userAdmin')

describe('Internal|User.proposals visibility', () => {
  it('returns visible proposals to an admin', async () => {
    await expect(
      graphql(UserProposalsVisibilityQuery, { userId: userAdminId, after: null }, 'internal_admin_capco'),
    ).resolves.toMatchSnapshot()
  })

  it('returns visible proposals to a super admin', async () => {
    await expect(
      graphql(
        UserProposalsVisibilityQuery,
        { userId: userAdminId, after: 'YXJyYXljb25uZWN0aW9uOjM=' },
        'internal_sfavot',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('returns public proposals to an anonymous user', async () => {
    await expect(
      graphql(UserProposalsVisibilityQuery, { userId: userAdminId, after: 'YXJyYXljb25uZWN0aW9uOjI=' }, 'internal'),
    ).resolves.toMatchSnapshot()
  })

  it('returns proposals visible to a user in the same group', async () => {
    await expect(
      graphql(
        UserProposalsVisibilityQuery,
        {
          userId: toGlobalId('User', 'user1'),
          after: 'YXJyYXljb25uZWN0aW9uOjY0',
        },
        'internal_saitama',
      ),
    ).resolves.toMatchSnapshot()
  })
})
