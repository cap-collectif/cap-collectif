/* eslint-env jest */
import '../../../resetDatabaseBeforeEach'

const DeleteArgumentMutation = /* GraphQL*/ `
    mutation ($input: DeleteArgumentInput!) {
      deleteArgument(input: $input) {
        argumentable {
          id
        }
      }
    }
`

describe('mutations.deleteArgumentMutation', () => {
  it('Author wants to delete his argument', async () => {
    await expect(
      graphql(
        DeleteArgumentMutation,
        {
          input: {
            argumentId: 'QXJndW1lbnQ6YXJndW1lbnQx',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('User wants to delete an argument but is not the author', async () => {
    await expect(
      graphql(
        DeleteArgumentMutation,
        {
          input: {
            argumentId: 'QXJndW1lbnQ6YXJndW1lbnQx',
          },
        },
        'internal_kiroule',
      ),
    ).rejects.toThrowError(/^You are not the author of argument with id: argument1/)
  })
})
