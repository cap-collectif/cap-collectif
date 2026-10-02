/* eslint-env jest */
import '../../../_setupDB'

const ChangeArgumentMutation = /* GraphQL*/ `
    mutation ($input: ChangeArgumentInput!) {
      changeArgument(input: $input) {
        argument {
          id
          body
        }
      }
    }
`

describe('mutations.changeArgumentMutation', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('Author wants to update his argument', async () => {
    await expect(
      graphql(
        ChangeArgumentMutation,
        {
          input: {
            argumentId: 'QXJndW1lbnQ6YXJndW1lbnQx',
            body: 'New Tololo',
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
  it('User wants to update an argument but is not the author', async () => {
    await expect(
      graphql(
        ChangeArgumentMutation,
        {
          input: {
            argumentId: 'QXJndW1lbnQ6YXJndW1lbnQx',
            body: 'New Tololo',
          },
        },
        'internal_kiroule',
      ),
    ).rejects.toThrowError("Can't update the argument of someone else.")
  })
})
