/* eslint-env jest */
import '../../../_setup';

const AddCollectStep = /* GraphQL*/ `
  mutation AddCollectStep($input: AddStepInput!) {
    addCollectStep(input: $input) {
      step {
        __typename
        title
      }
    }
  }
`

describe('mutations.addCollectStepMutation', () => {
  it('admin should be able to add collect step.', async () => {
    const response = await graphql(
      AddCollectStep,
      {input: {projectId: toGlobalId('Project', 'project9')}},
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
  it('admin project should be able to add collect step.', async () => {
    const response = await graphql(
      AddCollectStep,
      {input: {projectId: toGlobalId('Project', 'projectWithOwner') }},
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });
  it('orga member should be able to add collect step.', async () => {
    const response = await graphql(
      AddCollectStep,
      {input: {projectId: toGlobalId('Project', 'projectOrgaVisibilityMe') }},
      'internal_christophe',
    );
    expect(response).toMatchSnapshot();
  });
});
