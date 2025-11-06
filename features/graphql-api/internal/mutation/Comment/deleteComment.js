/* eslint-env jest */
import '../../../_setup'

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

  it('User wants to delete a comment but is not the author', async () => {
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
    ).rejects.toThrowError('Access denied to this field.')
  })
})
