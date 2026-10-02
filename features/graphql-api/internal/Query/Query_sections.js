/* eslint-env jest */

const SectionsQuery = /* GraphQL */ `
  query SectionsQuery {
    sections {
      id
    }
  }
`

const SectionsByUserQuery = /* GraphQL */ `
  query SectionsByUserQuery($user: ID!) {
    sections(user: $user) {
      id
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query.sections', () => {
  it('lists all sections', async () => {
    await expect(graphql(SectionsQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })

  it('lists sections for a user', async () => {
    await expect(graphql(SectionsByUserQuery, { user: 'VXNlcjp1c2VyNQ==' }, 'internal')).resolves.toMatchSnapshot()
  })
})
