//* eslint-env jest */
const FontsQuery = /* GraphQL */ `
  query FontsQuery {
    fonts {
      id
      name
      useAsBody
      useAsHeading
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query fonts', () => {
  it('fetches the available fonts', async () => {
    await expect(graphql(FontsQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
