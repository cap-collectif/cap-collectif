/* eslint-env jest */
const UserTypes = /* GraphQL */ `
  query UserTypes {
    userTypes {
      totalCount
      pageInfo {
        hasPreviousPage
        hasNextPage
        endCursor
        startCursor
      }
      edges {
        node {
          id
          name
          translations {
            name
            locale
            slug
          }
          media {
            id
            name
            url
            size
            description
            enabled
            height
            width
            authorName
            contentType
            copyright
            providerReference
          }
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query.userTypes', () => {
  it('fetches all user types', async () => {
    await expect(graphql(UserTypes, null, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
