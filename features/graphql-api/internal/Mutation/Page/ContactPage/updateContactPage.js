/* eslint-env jest */
import '../../../../_setupDB'

const UpdateContactPageMutation = /* GraphQL*/ `
    mutation ($input: UpdateContactPageInput!) {
      updateContactPage(input: $input) {
        title
        description
        customcode
      }
    }
`

describe('mutations.updateContactPage', () => {
  it('Admin wants to update contact page informations.', async () => {
    await expect(
      graphql(
        UpdateContactPageMutation,
        {
          input: {
            title: 'Je suis le nouveau titre',
            description: '<p>Je suis la nouvelle description</p>',
            customcode: null,
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Admin wants to create a new traduction of contact page informations in english', async () => {
    await expect(
      graphql(
        UpdateContactPageMutation,
        {
          input: {
            title: 'I am the new new title',
            locale: 'en-GB',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Admin wants to update contact page informations in english', async () => {
    await expect(
      graphql(
        UpdateContactPageMutation,
        {
          input: {
            title: 'I am the new title',
            locale: 'en-GB',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Normal user wants to update contact page informations', async () => {
    await expect(
      graphql(
        UpdateContactPageMutation,
        {
          input: {
            title: 'Je suis le nouveau titre',
            description: '<p>Je suis la nouvelle description</p>',
          },
        },
        'internal_user_conseil_regional',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
