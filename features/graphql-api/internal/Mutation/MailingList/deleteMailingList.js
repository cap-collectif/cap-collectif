/* eslint-env jest */
import '../../../_setup'

const DeleteMailingListMutation = /* GraphQL*/ `
    mutation ($input: DeleteMailingListInput!) {
      deleteMailingList(input: $input) {
        error
        deletedIds
      }
    }
`

describe('mutations.createMailingListMutation', () => {
  it('GraphQL admin wants to delete a mailing list', async () => {
    await expect(
      graphql(
        DeleteMailingListMutation,
        {
          input: {
            ids: ['TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0'],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL project owner wants to delete its mailing list', async () => {
    await expect(
      graphql(
        DeleteMailingListMutation,
        {
          input: {
            ids: ['TWFpbGluZ0xpc3Q6ZW1wdHlNYWlsaW5nTGlzdFdpdGhPd25lcg=='],
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin wants to delete a mailing list but provide wrong id', async () => {
    await expect(
      graphql(
        DeleteMailingListMutation,
        {
          input: {
            ids: ['TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0', 'wrongId'],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL project owner wants to delete other one mailing list', async () => {
    await expect(
      graphql(
        DeleteMailingListMutation,
        {
          input: {
            ids: ['TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0'],
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin wants to delete a mailing list but provide no id', async () => {
    await expect(
      graphql(
        DeleteMailingListMutation,
        {
          input: {
            ids: [],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin wants to delete a not deletable mailing list', async () => {
    await expect(
      graphql(
        DeleteMailingListMutation,
        {
          input: {
            ids: ['TWFpbGluZ0xpc3Q6bWFpbGluZ0xpc3RXaXRob3V0UHJvamVjdA=='],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
