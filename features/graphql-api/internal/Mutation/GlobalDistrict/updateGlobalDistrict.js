/* eslint-env jest */
import '../../../_setup'

const UpdateGlobalDistrictMutation = /* GraphQL*/ `
    mutation ($input: UpdateGlobalDistrictInput!) {
      updateGlobalDistrict(input: $input) {
        district {
          id
          geojson
          displayedOnMap
          border {
            enabled
            color
            opacity
            size
          }
          background {
            enabled
          }
          translations {
            name
            locale
            titleOnMap
            description
          }
        }
        userErrors {
          message
        }
      }
    }
`

describe('mutations.updateGlobalDistrictMutation', () => {
  it('Admin can update a global district', async () => {
    await expect(
      graphql(
        UpdateGlobalDistrictMutation,
        {
          input: {
            id: 'RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qx',
            geojson: null,
            displayedOnMap: true,
            border: {
              enabled: true,
              color: '#FFFFFF',
              opacity: 0.8,
              size: 1,
            },
            background: {
              enabled: false,
            },
            translations: [
              {
                locale: 'en-GB',
                name: 'My new awesome district !',
                titleOnMap: 'Short name',
                description: 'Short description.',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Admin wants to update a district in projects', async () => {
    await expect(
      graphql(
        UpdateGlobalDistrictMutation,
        {
          input: {
            id: 'RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qx',
            geojson: null,
            displayedOnMap: true,
            border: {
              enabled: true,
              color: '#FFFFFF',
              opacity: 0.8,
              size: 1,
            },
            background: {
              enabled: false,
            },
            translations: [
              {
                locale: 'en-GB',
                name: 'My new awesome district !',
                titleOnMap: 'Short name',
                description: 'Short description.',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Admin wants to update a district with another translation', async () => {
    await expect(
      graphql(
        UpdateGlobalDistrictMutation,
        {
          input: {
            id: 'RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qx',
            geojson: null,
            displayedOnMap: true,
            border: {
              enabled: true,
              color: '#FFFFFF',
              opacity: 0.8,
              size: 1,
            },
            background: {
              enabled: false,
            },
            translations: [
              { locale: 'en-GB', name: 'My new awesome district !' },
              { locale: 'fr-FR', name: 'Mon super quartier !' },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Admin wants to receive error during updating a district in projects', async () => {
    await expect(
      graphql(
        UpdateGlobalDistrictMutation,
        {
          input: {
            id: 'wrongDistrictId',
            translations: [{ locale: 'fr-FR', name: 'Quartier à jour' }],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
