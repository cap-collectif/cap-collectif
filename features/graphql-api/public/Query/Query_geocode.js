/* eslint-env jest */
const GeoCodeQueryQuery = /* GraphQL */ `
  query GeoCodeQuery($latitude: Float!, $longitude: Float!) {
    geocode(latitude: $latitude, longitude: $longitude) {
      json
      formatted
    }
  }
`

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
