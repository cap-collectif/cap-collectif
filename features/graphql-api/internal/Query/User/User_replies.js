/* eslint-env jest */

const UserRepliesQuery = /* GraphQL */ `
  query UserRepliesQuery($userId: ID!) {
    user: node(id: $userId) {
      ... on User {
        id
        replies {
          totalCount
          edges {
            node {
              createdAt
              author {
                id
                username
              }
              private
              id
            }
          }
        }
      }
    }
  }
`

const UserRepliesAuthorQuery = /* GraphQL */ `
  query UserRepliesAuthorQuery($userId: ID!) {
    user: node(id: $userId) {
      ... on User {
        id
        replies {
          totalCount
          edges {
            node {
              author {
                _id
              }
            }
          }
        }
      }
    }
  }
`

const user5Id = toGlobalId('User', 'user5')
const userAdminId = toGlobalId('User', 'userAdmin')
describe('Internal|User.replies visibility', () => {
  it('hides user5 replies from another user', async () => {
    await expect(
      graphql(UserRepliesQuery, { userId: user5Id }, 'internal_user_conseil_regional'),
    ).resolves.toMatchSnapshot()
  })

  it('returns an author replies', async () => {
    await expect(graphql(UserRepliesQuery, { userId: user5Id }, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('returns user5 replies to an admin', async () => {
    await expect(graphql(UserRepliesQuery, { userId: user5Id }, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('returns group replies to an administrator in the group', async () => {
    await expect(graphql(UserRepliesQuery, { userId: user5Id }, 'internal_super_admin')).resolves.toMatchSnapshot()
  })

  it('returns userAdmin replies to another user', async () => {
    await expect(
      graphql(UserRepliesAuthorQuery, { userId: userAdminId }, 'internal_user_conseil_regional'),
    ).resolves.toMatchSnapshot()
  })

  it('returns all userAdmin replies to an admin', async () => {
    await expect(graphql(UserRepliesAuthorQuery, { userId: userAdminId }, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
