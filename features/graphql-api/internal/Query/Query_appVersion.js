/* eslint-env jest */
const AppVersionQuery = /* GraphQL */ `
  query AppVersionQuery {
    appVersion
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query.appVersion', () => {
  it('returns the app version', async () => {
    await expect(graphql(AppVersionQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
