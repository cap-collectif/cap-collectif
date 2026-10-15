/* eslint-env jest */
import '../../../_setupDB'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|ShieldConfig', () => {
  // The mutation changes Redis; restoring MySQL does not reset this flag.
  afterEach(async () => {
    await global.disableFeatureFlag('shield_mode')
  })

  it('Updates a shield config as admin', async () => {
    await expect(
      graphql(
        /* GraphQL */ `
          mutation UpdateShieldAdminFormMutation($input: UpdateShieldAdminFormInput!) {
            updateShieldAdminForm(input: $input) {
              clientMutationId
              shieldAdminForm {
                introduction
                shieldMode
                translations {
                  locale
                  introduction
                }
                media {
                  id
                  name
                  size
                  height
                  width
                  enabled
                  copyright
                  authorName
                  description
                  providerReference
                  type: contentType
                  url(format: "reference")
                }
              }
            }
          }
        `,
        {
          input: {
            mediaId: 'ProfilePicBobMarley',
            shieldMode: true,
            translations: [
              {
                locale: 'fr-FR',
                introduction: '<p>Jean est une belle personne</p>',
              },
              {
                locale: 'en-GB',
                introduction: '<p>Jean is a great person and he deserve a great wife.</p>',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
