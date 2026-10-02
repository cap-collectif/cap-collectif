/* eslint-env jest */

const InternalQuery = /* GraphQL */ `
  query InternalQuery {
    consultations {
      edges {
        node {
          id
          title
          contribuable
          sections {
            title
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
describe('Internal|Query.consultations', () => {
  it('fetches all consultations', async () => {
    await expect(graphql(InternalQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
