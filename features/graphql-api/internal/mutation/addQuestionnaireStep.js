/* eslint-env jest */
import '../../_setup';

const AddQuestionnaireStep = /* GraphQL*/ `
  mutation AddQuestionnaireStep($input: AddStepInput!) {
    addQuestionnaireStep(input: $input) {
      step {
        __typename
        title
        ...on QuestionnaireStep {
          questionnaire {
            title
          }
        }
      }
    }
  }
`

const input = {
  title: 'My questionnaire step'
}

describe('mutations.addQuestionnaireStepMutation', () => {
  it('admin should be able to add questionnaire step.', async () => {
    const response = await graphql(
      AddQuestionnaireStep,
      {input: {...input, projectId: toGlobalId('Project', 'project9')}},
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
  it('admin project should be able to add questionnaire step.', async () => {
    const response = await graphql(
      AddQuestionnaireStep,
      {input: { ...input, projectId: toGlobalId('Project', 'projectWithOwner') }},
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });
  it('orga member should be able to add questionnaire step.', async () => {
    const response = await graphql(
      AddQuestionnaireStep,
      {input: { ...input, projectId: toGlobalId('Project', 'projectOrgaVisibilityMe') }},
      'internal_christophe',
    );
    expect(response).toMatchSnapshot();
  });
});