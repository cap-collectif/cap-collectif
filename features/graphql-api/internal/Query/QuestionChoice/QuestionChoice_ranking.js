/* eslint-env jest */

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

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|QuestionChoice.ranking', () => {
  it('hides choice rankings from ordinary users', async () => {
    const result = await graphql(
      QuestionChoiceRankingQuery,
      { questionnaireId: toGlobalId('Questionnaire', 'questionnaire4') },
      'internal_user',
    )
    const choices = result.questionnaire.questions.flatMap(question => question.choices?.edges || [])
    expect(choices.length).toBeGreaterThan(0)
    choices.forEach(({ node }) => expect(node.ranking).toEqual([]))
  })
})
