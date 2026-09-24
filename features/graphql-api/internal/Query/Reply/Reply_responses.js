/* eslint-env jest */

const ReplyResponsesQuery = /* GraphQL */ `
  query ReplyResponsesQuery($replyId: ID!) {
    reply: node(id: $replyId) {
      ... on Reply {
        responses {
          ... on ValueResponse {
            value
          }
        }
      }
    }
  }
`

const ValueResponseQuery = /* GraphQL */ `
  query ValueResponseQuery($responseId: ID!) {
    node(id: $responseId) {
      ... on ValueResponse {
        value
        formattedValue
      }
    }
  }
`

const variables = { replyId: 'reply8' }
const anonymousReplyVariables = { replyId: toGlobalId('Reply', 'replyAnonymous1') }

describe('Internal|Reply.responses', () => {
  it('returns questionnaire responses to an anonymous user', async () => {
    await expect(
      graphql(ReplyResponsesQuery, variables, 'internal'),
    ).resolves.toMatchObject({ reply: { responses: expect.arrayContaining([{ value: 'secret' }]) } })
  })

  it('returns anonymous replies and response nodes without a participant cookie', async () => {
    await expect(
      graphql(ReplyResponsesQuery, anonymousReplyVariables, 'internal'),
    ).resolves.toMatchObject({ reply: { responses: expect.arrayContaining([{ value: 'bien' }]) } })
    await expect(
      graphql(
        ValueResponseQuery,
        { responseId: toGlobalId('ValueResponse', 'responseAnonymousQuestionnaire1') },
        'internal',
      ),
    ).resolves.toMatchObject({ node: { value: 'bien' } })
  })
})
