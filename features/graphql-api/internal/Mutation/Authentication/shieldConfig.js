/* eslint-env jest */
import '../../../_setupDB'

describe('Internal|ShieldConfig', () => {
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
