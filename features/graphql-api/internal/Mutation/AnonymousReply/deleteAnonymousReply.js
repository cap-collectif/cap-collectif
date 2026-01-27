/* eslint-env jest */
import '../../../_setupDB'

const DeleteAnonymousReplyMutation = /* GraphQL*/ `
    mutation DeleteAnonymousReplyMutation($input: DeleteAnonymousReplyInput!) {
        deleteAnonymousReply(input: $input) {
            questionnaire {
                id
            }
            replyId
        }
    }
`

describe('mutations.deleteAnonymousReply', () => {
  it('should throw an error when participant token is not found', async () => {
    await expect(
      graphql(
        DeleteAnonymousReplyMutation,
        {
          input: {
            replyId: toGlobalId('Reply', 'replyAnonymous1'),
            participantToken: 'def',
          },
        },
        'internal',
      ),
    ).rejects.toThrowError('Given token does not match corresponding Participant')
  })

  it('should delete an anonymous reply', async () => {
    const response = await graphql(
      DeleteAnonymousReplyMutation,
      {
        input: {
          replyId: toGlobalId('Reply', 'replyAnonymous1'),
          participantToken: btoa('fakeToken1'),
        },
      },
      'internal',
    )

    expect(response).toMatchSnapshot()
  })
})
