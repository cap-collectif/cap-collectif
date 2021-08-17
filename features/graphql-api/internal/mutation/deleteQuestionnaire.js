/* eslint-env jest */
import '../../_setup';

const DeleteQuestionnaireMutation = /* GraphQL */ `
  mutation DeleteQuestionnaire($input: DeleteQuestionnaireInput!) {
    deleteQuestionnaire(input: $input) {
      deletedQuestionnaireId
    }
  }
`;

describe('Internal|deleteQuestionnaire mutation', () => {
  it('should delete correctly', async () => {
    const response = await graphql(
      DeleteQuestionnaireMutation,
      {
        input: {
          id: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==',
        },
      },
      'internal_admin',
    );

    expect(response.deleteQuestionnaire.deletedQuestionnaireId).toBe(
      'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==',
    );
  });

  it('should throw an access denied when project admin user attempt to delete a questionnaire that he does not own', async () => {
    await expect(
      graphql(
        DeleteQuestionnaireMutation,
        { input: { id: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMTA=' } },
        'internal_theo',
      ),
    ).rejects.toThrowError('Access denied to this field.');
  });

  it('should throw an access denied when questionnaire does not exist', async () => {
    await expect(
      graphql(DeleteQuestionnaireMutation, { input: { id: 'abc' } }, 'internal_admin'),
    ).rejects.toThrowError('Access denied to this field.');
  });
});
