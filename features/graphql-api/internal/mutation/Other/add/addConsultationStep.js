/* eslint-env jest */
import '../../../../_setup';

const AddConsultationStep = /* GraphQL*/ `
  mutation AddConsultationStep($input: AddStepInput!) {
    addConsultationStep(input: $input) {
      step {
        __typename
        title
      }
    }
  }
`

const input = {
  title: 'My consultation step'
}

describe('mutations.addConsultationStepMutation', () => {
  it('admin should be able to add consultation step.', async () => {
    const response = await graphql(
      AddConsultationStep,
      {input: {...input, projectId: toGlobalId('Project', 'project9')}},
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
  it('admin project should be able to add consultation step.', async () => {
    const response = await graphql(
      AddConsultationStep,
      {input: { ...input, projectId: toGlobalId('Project', 'projectWithOwner') }},
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });
  it('orga member should be able to add consultation step.', async () => {
    const response = await graphql(
      AddConsultationStep,
      {input: { ...input, projectId: toGlobalId('Project', 'projectOrgaVisibilityMe') }},
      'internal_christophe',
    );
    expect(response).toMatchSnapshot();
  });
});