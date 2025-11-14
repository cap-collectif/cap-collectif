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

describe('Internal|Query fonts', () => {
  it('fetches the available fonts', async () => {
    await expect(graphql(FontsQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
