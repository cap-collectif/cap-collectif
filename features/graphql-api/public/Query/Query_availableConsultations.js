/* eslint-env jest */

const InternalQuery = /* GraphQL */ `
  query InternalQuery {
    availableConsultations {
      id
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query.availableConsultations', () => {
  it('fetches consultations without step', async () => {
    await expect(graphql(InternalQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
