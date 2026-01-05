/* eslint-env jest */
import '../../../../_setup'

const createGlobalDistrictMutation = /* GraphQL */ `
  mutation ($input: CreateGlobalDistrictInput!) {
    createGlobalDistrict(input: $input) {
      district {
        id
        geojson
        displayedOnMap
        border {
          color
          opacity
          size
        }
        background {
          color
          opacity
        }
        translations {
          locale
          name
        }
      }
    }
  }
`

describe('Internal|Global district', () => {
  it('Admin wants to create a district in projects', async () => {
    await expect(
      graphql(
        createGlobalDistrictMutation,
        {
          input: {
            geojson: null,
            displayedOnMap: true,
            border: {
              enabled: true,
              color: '#AADDAA',
              opacity: 0.6,
              size: 2,
            },
            background: {
              enabled: true,
              color: '#AAEEAA',
              opacity: 0.1,
            },
            translations: [
              {
                name: 'Mon super quartier',
                locale: 'fr-FR',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createGlobalDistrict: {
        district: {
          id: expect.any(String),
        },
      },
    })
  })
})
