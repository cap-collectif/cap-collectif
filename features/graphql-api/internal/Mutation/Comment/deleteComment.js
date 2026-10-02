/* eslint-env jest */
import '../../../_setupDB'

const DeleteCommentMutation = /* GraphQL*/ `
    mutation ($input: DeleteCommentInput!) {
      deleteComment(input: $input) {
        deletedCommentId
        userErrors {
          message
        }
      }
    }
`

describe('mutations.deleteCommentMutation', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('Author wants to delete his comment', async () => {
    await expect(
      graphql(
        DeleteCommentMutation,
        {
          input: {
            id: 'Q29tbWVudDpldmVudENvbW1lbnQx',
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
  it('User wants to delete a comment but is not the author', async () => {
    await expect(
      graphql(
        DeleteCommentMutation,
        {
          input: {
            id: 'Q29tbWVudDpldmVudENvbW1lbnQxMA==',
          },
        },
        'internal_user',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
