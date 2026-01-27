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

describe('Internal|Query.globalDistricts', () => {
  it('fetches all project districts', async () => {
    await expect(graphql(InternalQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
