import '../../../_setupDB'

const DeleteReplyMutation = /* GraphQL */ `
  mutation ($input: DeleteUserReplyInput!) {
    deleteUserReply(input: $input) {
      questionnaire {
        id
      }
      replyId
    }
  }
`

describe('mutations.deleteUserReplyMutation', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('User can delete his reply', async () => {
    await expect(
      graphql(
        DeleteReplyMutation,
        {
          input: {
            id: 'UmVwbHk6cmVwbHk1',
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
  it('User can not delete the reply of someone else', async () => {
    await expect(
      graphql(
        DeleteReplyMutation,
        {
          input: {
            id: 'UmVwbHk6cmVwbHky',
          },
        },
        'internal_user',
      ),
    ).rejects.toThrowError('Reply not found')
  })
})
