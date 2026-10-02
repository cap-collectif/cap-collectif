/* eslint-env jest */
import '../../../../_setupDB'

const DeleteQuestionnaireMutation = /* GraphQL */ `
  mutation DeleteQuestionnaire($input: DeleteQuestionnaireInput!) {
    deleteQuestionnaire(input: $input) {
      deletedQuestionnaireId
    }
  }
`

describe('Internal|deleteQuestionnaire mutation', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
   * the database helper runs only before each test.
   */
  it('should delete correctly', async () => {
    const response = await graphql(
      DeleteQuestionnaireMutation,
      {
        input: {
          id: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==',
        },
      },
      'internal_admin',
    )

    expect(response.deleteQuestionnaire.deletedQuestionnaireId).toBe('UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==')
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('should throw an access denied when project admin user attempt to delete a questionnaire that he does not own', async () => {
    await expect(
      graphql(
        DeleteQuestionnaireMutation,
        { input: { id: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMTA=' } },
        'internal_theo',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('should throw an access denied when questionnaire does not exist', async () => {
    await expect(graphql(DeleteQuestionnaireMutation, { input: { id: 'abc' } }, 'internal_admin')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
})
