/* eslint-env jest */
import '../../../../_setup'

const UpdateQuestionnaireChoicesMutation = /* GraphQL */ `
  mutation UpdateQuestionnaireConfiguration($input: UpdateQuestionnaireConfigurationInput!) {
    updateQuestionnaireConfiguration(input: $input) {
      questionnaire {
        questions {
          ... on MultipleChoiceQuestion {
            choices(allowRandomize: false) {
              totalCount
              edges {
                node {
                  id
                }
              }
            }
          }
        }
        isIndexationDone
      }
    }
  }
`

const UpdateQuestionnaireMutation = /* GraphQL */ `
  mutation UpdateQuestionnaireMutation($input: UpdateQuestionnaireConfigurationInput!) {
    updateQuestionnaireConfiguration(input: $input) {
      questionnaire {
        title
        description
        owner {
          id
          username
        }
      }
    }
  }
`

describe('Internal|updateQuestionnaireConfiguration mutation', () => {
  it('Add over 1000 choices and some duplicates choices', async () => {
    const questionnaireId = 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMTA='
    const generatedChoices = []
    for (var i = 0; i < 1000; i++) {
      generatedChoices.push({
        color: null,
        description: null,
        image: null,
        title: 'mon choix ' + i,
      })
    }
    const response = await graphql(
      UpdateQuestionnaireChoicesMutation,
      {
        input: {
          questionnaireId: questionnaireId,
          title: 'Questionnaire non rattaché',
          questions: [
            {
              question: {
                id: 'UXVlc3Rpb246NDk=',
                private: false,
                otherAllowed: false,
                randomQuestionChoices: false,
                choices: generatedChoices,
                required: false,
                title: "j'ai plusieurs choix ?",
                type: 'radio',
              },
            },
          ],
        },
      },
      'internal_admin',
    )

    expect(response).toMatchSnapshot({
      updateQuestionnaireConfiguration: {
        questionnaire: {
          questions: [
            {
              choices: {
                edges: [...Array(1000)].map(_ => ({
                  node: {
                    id: expect.any(String),
                  },
                })),
              },
            },
          ],
          isIndexationDone: true,
        },
      },
    })
  })

  it('Add over 1500 choices and some duplicates choices', async () => {
    const questionnaireId = 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlQWRtaW4='
    const generatedChoices = []
    for (var i = 0; i < 1600; i++) {
      generatedChoices.push({
        color: null,
        description: null,
        image: null,
        title: 'mon choix ' + i,
      })
    }
    const response = await graphql(
      UpdateQuestionnaireChoicesMutation,
      {
        input: {
          questionnaireId: questionnaireId,
          title: 'Questionnaire non rattaché',
          questions: [
            {
              question: {
                private: false,
                otherAllowed: false,
                randomQuestionChoices: false,
                choices: generatedChoices,
                required: false,
                title: "j'ai plusieurs choix ?",
                type: 'radio',
              },
            },
          ],
        },
      },
      'internal_admin',
    )

    expect(response.updateQuestionnaireConfiguration.questionnaire.questions[0].choices.totalCount).toBe(0)
    expect(response).toMatchSnapshot({
      updateQuestionnaireConfiguration: {
        questionnaire: {
          isIndexationDone: true,
          questions: [{ choices: { edges: [], totalCount: 0 } }],
        },
      },
    })
  })

  it('should update correctly', async () => {
    const response = await graphql(
      UpdateQuestionnaireMutation,
      {
        input: {
          title: 'test',
          description: '<p>abc</p>',
          questionnaireId: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==',
        },
      },
      'internal_admin',
    )

    expect(response.updateQuestionnaireConfiguration.questionnaire.title).toBe('test')
    expect(response.updateQuestionnaireConfiguration.questionnaire.description).toBe('<p>abc</p>')
    expect(response.updateQuestionnaireConfiguration.questionnaire.owner).toBe(null)
  })

  it('should throw an access denied if a project admin user attempt to update a questionnaire that he does not own', async () => {
    await expect(
      graphql(
        UpdateQuestionnaireMutation,
        {
          input: {
            title: 'test',
            questionnaireId: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==',
          },
        },
        'internal_theo',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('should throw an access denied when questionnaire does not exist', async () => {
    await expect(
      graphql(
        UpdateQuestionnaireMutation,
        {
          input: {
            title: 'test',
            questionnaireId: 'abc',
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
