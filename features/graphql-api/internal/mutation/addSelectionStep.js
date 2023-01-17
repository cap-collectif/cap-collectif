/* eslint-env jest */
import '../../_setup';

const AddSelectionStep = /* GraphQL*/ `
  mutation AddSelectionStep($input: AddStepInput!) {
    addSelectionStep(input: $input) {
      step {
        __typename
        title
      }
    }
  }
`

const input = {
  title: 'My selection step'
}

describe('mutations.addSelectionStepMutation', () => {
  it('admin should be able to add selection step.', async () => {
    const response = await graphql(
      AddSelectionStep,
      {input: {...input, projectId: toGlobalId('Project', 'project9')}},
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
  it('admin project should be able to add selection step.', async () => {
    const response = await graphql(
      AddSelectionStep,
      {input: { ...input, projectId: toGlobalId('Project', 'projectWithOwner') }},
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });
  it('orga member should be able to add selection step.', async () => {
    const response = await graphql(
      AddSelectionStep,
      {input: { ...input, projectId: toGlobalId('Project', 'projectOrgaVisibilityMe') }},
      'internal_christophe',
    );
    expect(response).toMatchSnapshot();
  });
});