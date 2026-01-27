/* eslint-env jest */
import '../../../_setupDB'

const UpdateQuestionnaireMutation = /* GraphQL*/ `
    mutation ($input: UpdateQuestionnaireConfigurationInput!) {
      updateQuestionnaireConfiguration(input: $input) {
        questionnaire {
          id
          title
          description
          questions {
            id
            title
            helpText
            description
            type
            private
            required
            kind
            ... on MultipleChoiceQuestion {
              choices(allowRandomize: false) {
                edges {
                  node {
                    id
                    title
                  }
                }
              }
            }
          }
        }
      }
    }
`

describe('mutations.updateQuestionnaireMutation', () => {
  it('GraphQL admin wants to update a questionnaire', async () => {
    await expect(
      graphql(
        UpdateQuestionnaireMutation,
        {
          input: {
            questionnaireId: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMg==',
            title: 'New title',
            description: '<p>New description</p>',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin wants to reorder questions', async () => {
    await expect(
      graphql(
        UpdateQuestionnaireMutation,
        {
          input: {
            questionnaireId: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMg==',
            questions: [
              {
                question: {
                  description: '<p><strong>Youpla</strong></p>',
                  helpText: 'text',
                  id: 'UXVlc3Rpb246NjY2',
                  private: false,
                  required: true,
                  title: 'Luffy ou Zoro ?',
                  type: 'text',
                },
              },
              {
                question: {
                  description: 'Ceci est un test',
                  helpText: 'text',
                  id: 'UXVlc3Rpb246NA==',
                  private: false,
                  required: true,
                  title: "Hé salut les amis ! C'est david lafarge pokemon comment allez-vous ?",
                  type: 'text',
                },
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin wants to delete first question', async () => {
    await expect(
      graphql(
        UpdateQuestionnaireMutation,
        {
          input: {
            questionnaireId: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMTA=',
            title: 'Questionnaire non rattaché',
            description: '<p>Excepturi esse similique laudantium quis. Minus sint fugit voluptatem voluptas.</p>',
            questions: [
              {
                question: {
                  id: 'UXVlc3Rpb246NDk=',
                  private: false,
                  otherAllowed: false,
                  randomQuestionChoices: false,
                  choices: [
                    {
                      color: null,
                      description: null,
                      id: 'UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzNQ==',
                      image: null,
                      title: 'premier choix',
                    },
                    {
                      color: null,
                      description: null,
                      id: 'UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzNg==',
                      image: null,
                      title: 'deuxième choix',
                    },
                    {
                      color: null,
                      description: null,
                      id: 'UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzNw==',
                      image: null,
                      title: 'troisième choix',
                    },
                  ],
                  required: false,
                  title: "J'ai plusieurs choix?",
                  type: 'radio',
                },
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
