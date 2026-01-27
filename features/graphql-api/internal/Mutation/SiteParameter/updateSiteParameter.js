/* eslint-env jest */
import '../../../_setupDB'

const UpdateSiteParameterMutation = /* GraphQL*/ `
    mutation ($input: UpdateSiteParameterInput!) {
      updateSiteParameter(input: $input) {
        errorCode
        siteParameter {
          keyname
          value
        }
      }
    }
`

describe('mutations.updateSiteParameter', () => {
  it('GraphQL admin wants to add a bad email as reception email', async () => {
    await expect(
      graphql(
        UpdateSiteParameterMutation,
        {
          input: {
            keyname: 'RECEIVE_ADDRESS',
            value: 'jenesuispasunmail',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin adds a new email as reception email', async () => {
    await expect(
      graphql(
        UpdateSiteParameterMutation,
        {
          input: {
            keyname: 'RECEIVE_ADDRESS',
            value: 'receipt@mail.fr',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin update sender name', async () => {
    await expect(
      graphql(
        UpdateSiteParameterMutation,
        {
          input: {
            keyname: 'SEND_NAME',
            value: 'envoyeur',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
