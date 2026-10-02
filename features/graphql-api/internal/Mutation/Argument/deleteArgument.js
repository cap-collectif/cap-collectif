/* eslint-env jest */
import '../../../_setupDB'

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
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
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

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
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
