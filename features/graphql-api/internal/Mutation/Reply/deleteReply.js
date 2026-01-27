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
    ).rejects.toThrowError('You are not the author of this reply')
  })
})
