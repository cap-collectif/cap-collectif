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

const variables = { replyId: 'reply8' }

describe('Internal|Reply.responses', () => {
  it('hides responses from an anonymous user for a private questionnaire', async () => {
    await expect(graphql(ReplyResponsesQuery, variables, 'internal')).resolves.toMatchSnapshot()
  })

  it('returns responses to their author for a private questionnaire', async () => {
    await expect(graphql(ReplyResponsesQuery, variables, 'internal_user')).resolves.toMatchSnapshot()
  })

  it('returns responses to an admin for a private questionnaire', async () => {
    await expect(graphql(ReplyResponsesQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
