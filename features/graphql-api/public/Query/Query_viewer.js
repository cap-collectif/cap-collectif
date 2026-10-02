/* eslint-env jest */

const ViewerQuery = /* GraphQL */ `
  query ViewerQuery {
    viewer {
      id
      username
      email
      createdAt
      consentInternalCommunication
      avatarUrl
      websiteUrl
      facebookUrl
      twitterUrl
      linkedInUrl
      biography
      enabled
      deletedAccountAt
    }
  }
`

describe('Public|Query.viewer', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('fetches an admin', async () => {
    await expect(graphql(ViewerQuery, null, 'admin')).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an explicit result or refusal from the real GraphQL read contract using stable
   * fixture data.
   */
  it('can not access if not authenticated', async () => {
    await expect(graphql(ViewerQuery, null, 'anonymous')).rejects.toThrowError('Access denied to this field.')
  })
})

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query.viewer', () => {
  it('fetches admin@test.com when using internal_admin client ', async () => {
    await expect(graphql(ViewerQuery, null, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
