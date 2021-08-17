/* eslint-env jest */
import '../../_setup';

const CreateQuestionnaireMutation = /* GraphQL */ `
  mutation CreateQuestionnaireMutation($input: CreateQuestionnaireInput!) {
    createQuestionnaire(input: $input) {
      questionnaire {
        id
        title
        owner {
          id
          username
        }
      }
    }
  }
`;

describe('Internal.viewer.posts', () => {
  it('should create a questionnaire', async () => {
    const response = await graphql(
      CreateQuestionnaireMutation,
      {
        input: {
          type: 'QUESTIONNAIRE',
          title: 'questionnaire title',
        },
      },
      'internal_admin',
    );

    expect(response.createQuestionnaire.questionnaire.title).toBe('questionnaire title');
    expect(response.createQuestionnaire.questionnaire.owner).toBe(null);
  });

  it('should create a questionnaire with an owner', async () => {
    const response = await graphql(
      CreateQuestionnaireMutation,
      {
        input: {
          type: 'QUESTIONNAIRE',
          title: 'questionnaire title',
        },
      },
      'internal_theo',
    );

    expect(response.createQuestionnaire.questionnaire.owner.username).toBe('Théo QP');
  });
});
