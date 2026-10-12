/* eslint-env jest */
import '../../../_setupDB'
import { request, participantCookie } from '../../../_privacyGraphql'

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
  it('should reject an invalid participant cookie before execution', async () => {
    const result = await request(
      DeleteAnonymousReplyMutation,
      { input: { replyId: toGlobalId('Reply', 'replyAnonymous1') } },
      'internal',
      participantCookie('invalid'),
      true,
    )
    expect(result.errors[0].extensions.code).toBe('INVALID_PARTICIPANT_COOKIE')
    expect(result.data).toBeUndefined()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should delete an anonymous reply', async () => {
    const response = await request(
      DeleteAnonymousReplyMutation,
      {
        input: {
          replyId: toGlobalId('Reply', 'replyAnonymous1'),
        },
      },
      'internal',
      participantCookie('fakeToken1'),
    )

    expect(response).toMatchSnapshot()
  })
})
