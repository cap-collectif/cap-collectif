/* eslint-env jest */
import '../../../_setupDB'
import { request, participantCookie } from '../../../_privacyGraphql'

const UpdateAnonymousReplyMutation = /* GraphQL*/ `
    mutation UpdateAnonymousReplyMutation($input: UpdateAnonymousReplyInput!) {
        updateAnonymousReply(input: $input) {
            reply {
                __typename
                id
                responses {
                    ...on ValueResponse {
                        value
                    }
                }
            }
        }
    }
`

const input = {
  replyId: toGlobalId('Reply', 'replyAnonymous1'),
  responses: [
    {
      value: 'updated anonymous reply',
      question: 'UXVlc3Rpb246MTQwMw==',
    },
  ],
}

describe('mutations.updateAnonymousReply', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should update an anonymous reply', async () => {
    const response = await request(
      UpdateAnonymousReplyMutation,
      {
        input,
      },
      'internal',
      participantCookie('fakeToken1'),
    )

    expect(response).toMatchSnapshot()
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('should reject an invalid participant cookie before execution', async () => {
    const result = await request(
      UpdateAnonymousReplyMutation,
      { input: { replyId: toGlobalId('Reply', 'replyAnonymous1'), responses: [] } },
      'internal',
      participantCookie('invalid'),
      true,
    )
    expect(result.errors[0].extensions.code).toBe('INVALID_PARTICIPANT_COOKIE')
    expect(result.data).toBeUndefined()
  })
})
