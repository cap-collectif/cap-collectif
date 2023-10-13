/* eslint-env jest */
import '../../../_setup';

const AddQuestionnaireStep = /* GraphQL*/ `
  mutation AddQuestionnaireStep($input: AddStepInput!) {
    addQuestionnaireStep(input: $input) {
        step {
            __typename
            label
            title
            body
            enabled
            ... on QuestionnaireStep {
                isAnonymousParticipationAllowed
                collectParticipantsEmail
                questionnaire {
                    title
                    description
                    questions {
                        title
                        type
                        position
                    }
                }
            }
        }
    }
  }
`;

describe('mutations.addQuestionnaireStepMutation', () => {
  it('admin should be able to add questionnaire step.', async () => {
    const response = await graphql(
      AddQuestionnaireStep,
      { input: { projectId: toGlobalId('Project', 'project9') } },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
  it('admin project should be able to add questionnaire step.', async () => {
    const response = await graphql(
      AddQuestionnaireStep,
      { input: { projectId: toGlobalId('Project', 'projectWithOwner') } },
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });
  it('orga member should be able to add questionnaire step.', async () => {
    const response = await graphql(
      AddQuestionnaireStep,
      { input: { projectId: toGlobalId('Project', 'projectOrgaVisibilityMe') } },
      'internal_christophe',
    );
    expect(response).toMatchSnapshot();
  });
});
