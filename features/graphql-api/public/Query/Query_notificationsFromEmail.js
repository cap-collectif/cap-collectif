/* eslint-env jest */

const Query = /* GraphQL */ `
  query NotificationsFromQuery {
    notificationsFromEmail
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Query.notificationsFromEmail', () => {
  it('returns the from email.', async () => {
    await expect(graphql(Query, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
