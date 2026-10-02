/* eslint-env jest */

const GeoCodeQueryQuery = /* GraphQL */ `
  query GeoCodeQuery($latitude: Float!, $longitude: Float!) {
    geocode(latitude: $latitude, longitude: $longitude) {
      json
      formatted
    }
  }
`

/**
 * @jest-status compliant
 * @jest-reason Checks an explicit result or refusal from the real GraphQL read contract using stable fixture
 * data.
 */
describe('Internal|Query.geocode connection', () => {
  it('fetches the not found address from lat lng', async () => {
    const response = await graphql(
      GeoCodeQueryQuery,
      {
        latitude: 999.111,
        longitude: -991.3,
      },
      'internal',
    )
    expect(response).toMatchSnapshot()
    expect(response.geocode).toBeNull()
  })
})
