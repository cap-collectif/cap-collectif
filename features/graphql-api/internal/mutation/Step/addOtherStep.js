/* eslint-env jest */
import '../../../_setup';

const AddOtherStep = /* GraphQL*/ `
  mutation AddOtherStep($input: AddStepInput!) {
    addOtherStep(input: $input) {
      step {
        __typename
        title
      }
    }
  }
`

describe('mutations.addOtherStepMutation', () => {
  it('admin should be able to add other step.', async () => {
    const response = await graphql(
      AddOtherStep,
      {input: { projectId: toGlobalId('Project', 'project9')}},
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
  it('admin project should be able to add other step.', async () => {
    const response = await graphql(
      AddOtherStep,
      {input: { projectId: toGlobalId('Project', 'projectWithOwner') }},
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });
  it('orga member should be able to add other step.', async () => {
    const response = await graphql(
      AddOtherStep,
      {input: { projectId: toGlobalId('Project', 'projectOrgaVisibilityMe') }},
      'internal_christophe',
    );
    expect(response).toMatchSnapshot();
  });
});
