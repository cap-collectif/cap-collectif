/* eslint-env jest */
import '../../../_setup'

const ChangeDistrictMutation = /* GraphQL*/ `
    mutation ($input: ChangeDistrictInput!) {
      changeDistrict(input: $input) {
        district {
          name
          displayedOnMap
          geojson
        }
      }
    }
`

describe('mutations.changeDistrict', () => {
  it('GraphQL client wants to change district of a proposal', async () => {
    await expect(
      graphql(
        ChangeDistrictMutation,
        {
          input: {
            name: 'New name',
            displayedOnMap: false,
            districtId: 'RGlzdHJpY3Q6ZGlzdHJpY3Qx',
            geojson: null,
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL client wants to change district of a proposal but geojson is not even json', async () => {
    await expect(
      graphql(
        ChangeDistrictMutation,
        {
          input: {
            name: 'New name',
            displayedOnMap: false,
            districtId: 'RGlzdHJpY3Q6ZGlzdHJpY3Qx',
            geojson: "{'validjson':false, 'validGeoJSON': false}}}}}",
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('Input not valid.')
  })

  it('GraphQL client wants to change district of a proposal but has invalid geojson', async () => {
    await expect(
      graphql(
        ChangeDistrictMutation,
        {
          input: {
            name: 'New name',
            displayedOnMap: false,
            districtId: 'RGlzdHJpY3Q6ZGlzdHJpY3Qx',
            geojson: "{'validjson':true, 'validGeoJSON': false}",
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('Input not valid.')
  })

  it('GraphQL client wants to change district of a proposal and use a valid geoJson', async () => {
    await expect(
      graphql(
        ChangeDistrictMutation,
        {
          input: {
            name: 'New name',
            displayedOnMap: false,
            districtId: 'RGlzdHJpY3Q6ZGlzdHJpY3Qx',
            geojson:
              '{"type": "Feature", "properties": { "name": "a point"}, "geometry": {"type": "Point", "coordinates": [7.2874, 48.4165]}}',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
