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
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
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
    ).rejects.toThrowError('Participant not found.')
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
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
