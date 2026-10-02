/* eslint-env jest */

const InternalQuery = /* GraphQL */ `
  query InternalQuery {
    globalDistricts(first: 100) {
      totalCount
      edges {
        node {
          id
          name
          description
          projectDistrictPositioners {
            project {
              _id
              title
            }
          }
          projects {
            totalCount
            edges {
              node {
                _id
                title
              }
            }
          }
          followers {
            totalCount
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
describe('Internal|Query.globalDistricts', () => {
  it('fetches all project districts', async () => {
    await expect(graphql(InternalQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
