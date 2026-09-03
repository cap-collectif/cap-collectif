/* eslint-env jest */

const QuestionnaireUserHasReplyQuery = /* GraphQL */ `
  query QuestionnaireUserHasReplyQuery(
    $questionnaireId: ID!
    $loginA: String!
    $loginB: String!
    $loginC: String!
  ) {
    questionnaire: node(id: $questionnaireId) {
      ... on Questionnaire {
        spylHasReply: userHasReply(login: $loginA)
        msantostefanoHasReply: userHasReply(login: $loginB)
        unknownUserHasReply: userHasReply(login: $loginC)
      }
    }
  }
`

describe('Internal|Questionnaire.userHasReply', () => {
  it('checks whether users replied to a questionnaire', async () => {
    await expect(
      graphql(
        QuestionnaireUserHasReplyQuery,
        {
          questionnaireId: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==',
          loginA: 'aurelien@cap-collectif.com',
          loginB: 'msantostefano@cap-collectif.com',
          loginC: 'unknown@gmail.com',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
