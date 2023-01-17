/* eslint-env jest */
import '../../_setup';

const AddDebateStep = /* GraphQL*/ `
  mutation AddDebateStep($input: AddStepInput!) {
    addDebateStep(input: $input) {
      step {
        __typename
        title
      }
    }
  }
`

const input = {
  title: 'My debate step'
}

describe('mutations.addDebateStepMutation', () => {
  it('admin should be able to add debate step.', async () => {
    const response = await graphql(
      AddDebateStep,
      {input: {...input, projectId: toGlobalId('Project', 'project9')}},
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
  it('admin project should be able to add debate step.', async () => {
    const response = await graphql(
      AddDebateStep,
      {input: { ...input, projectId: toGlobalId('Project', 'projectWithOwner') }},
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });
  it('orga member should be able to add debate step.', async () => {
    const response = await graphql(
      AddDebateStep,
      {input: { ...input, projectId: toGlobalId('Project', 'projectOrgaVisibilityMe') }},
      'internal_christophe',
    );
    expect(response).toMatchSnapshot();
  });
});