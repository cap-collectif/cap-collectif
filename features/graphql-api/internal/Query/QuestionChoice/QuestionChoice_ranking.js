/* eslint-env jest */
import '../../../_setupES'

const QuestionChoiceRankingQuery = /* GraphQL */ `
  query QuestionChoiceRankingQuery($questionnaireId: ID!) {
    questionnaire: node(id: $questionnaireId) {
      ... on Questionnaire {
        questions {
          ... on MultipleChoiceQuestion {
            choices(allowRandomize: false) {
              edges {
                node {
                  title
                  ranking {
                    position
                    responses {
                      totalCount
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

describe('Internal|QuestionChoice.ranking', () => {
  it('returns the ranking of answered choices', async () => {
    await expect(
      graphql(
        QuestionChoiceRankingQuery,
        { questionnaireId: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlNA==' },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })
})
