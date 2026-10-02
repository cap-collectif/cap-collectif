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
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
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

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
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

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
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

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
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
