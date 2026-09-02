/* eslint-env jest */

import '../../../_setupES'

const UserCommentsVisibilityQuery = /* GraphQL */ `
  query UserCommentsVisibilityQuery($userId: ID!, $after: String) {
    user: node(id: $userId) {
      ... on User {
        comments(after: $after, first: 5) {
          edges {
            node {
              _id
              commentable {
                ... on Proposal {
                  project {
                    visibility
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

describe('Internal|User.comments visibility', () => {
  it('returns comments visible to a user in the same group', async () => {
    await expect(
      graphql(
        UserCommentsVisibilityQuery,
        {
          userId: toGlobalId('User', 'user2'),
          after: 'YToyOntpOjA7aToxNTE4OTEyMDAwMDAwO2k6MTtzOjEzOiJldmVudENvbW1lbnQyIjt9',
        },
        'internal_saitama',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('returns visible comments to a super admin', async () => {
    await expect(
      graphql(
        UserCommentsVisibilityQuery,
        {
          userId: toGlobalId('User', 'userAdmin'),
          after: 'YToyOntpOjA7aToxNDg1OTEwNjgwMDAwO2k6MTtzOjE3OiJwcm9wb3NhbENvbW1lbnQ1OCI7fQ==',
        },
        'internal_sfavot',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('returns public comments to an anonymous user', async () => {
    await expect(
      graphql(
        UserCommentsVisibilityQuery,
        {
          userId: toGlobalId('User', 'user1'),
          after: 'YToyOntpOjA7aToxNTIwNTUzNjAwMDAwO2k6MTtzOjE0OiJldmVudENvbW1lbnQyMSI7fQ==',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('returns admin comments to an admin', async () => {
    await expect(
      graphql(
        UserCommentsVisibilityQuery,
        {
          userId: toGlobalId('User', 'user2'),
          after: 'YToyOntpOjA7aToxNTE4OTEyMDAwMDAwO2k6MTtzOjEzOiJldmVudENvbW1lbnQyIjt9',
        },
        'internal_admin_capco',
      ),
    ).resolves.toMatchSnapshot()
  })
})
