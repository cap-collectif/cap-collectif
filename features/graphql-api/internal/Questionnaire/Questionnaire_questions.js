const QuestionnaireQuestionsQuery = /** GraphQL */ `
  query QuestionnaireQuestionsQuery($questionnaireId: ID!, $filter: QuestionsFilterType) {
    node(id: $questionnaireId) {
      ...on Questionnaire {
          id
          title
        questions(filter: $filter) {
            alwaysJumpDestinationQuestion {
              id
            }
            id
            title
            jumps {
              conditions {
                id
              }
              origin {
                title
              }
            }
          }
        }
      }
    }
`

const variables = {
  "questionnaireId": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlSnVtcHM=",
  "filter": null
}

describe('Internal|Questionnaire.questions', () => {
  it('should fetch all questions', async () => {
    await expect(
      graphql(QuestionnaireQuestionsQuery, variables, 'internal_admin'),
    ).resolves.toMatchSnapshot();
  });

  it('should fetch all questions with at least one jump or redirection', async () => {
    await expect(
      graphql(QuestionnaireQuestionsQuery, {
        ...variables,
        "filter": "JUMPS_ONLY"
      }, 'internal_admin'),
    ).resolves.toMatchSnapshot();
  });

})