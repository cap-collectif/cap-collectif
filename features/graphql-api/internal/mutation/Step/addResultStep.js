/* eslint-env jest */
import '../../../_setup';

const AddResultStep = /* GraphQL*/ `
    mutation AddResultStep($input: AddStepInput!) {
        addResultStep(input: $input) {
            step {
                __typename
                title
                label
                body
                ... on SelectionStep {
                    statuses {
                        name
                        color
                    }
                    defaultStatus {
                        name
                        color
                    }
                    allowAuthorsToAddNews
                    defaultSort
                    voteType
                }
            }
        }
    }
`;

describe('mutations.addResultStepMutation', () => {
  it('admin should be able to add result step.', async () => {
    const response = await graphql(
      AddResultStep,
      { input: { projectId: toGlobalId('Project', 'project9') } },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
  it('admin project should be able to add result step.', async () => {
    const response = await graphql(
      AddResultStep,
      { input: { projectId: toGlobalId('Project', 'projectWithOwner') } },
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });
  it('orga member should be able to add result step.', async () => {
    const response = await graphql(
      AddResultStep,
      { input: { projectId: toGlobalId('Project', 'projectOrgaVisibilityMe') } },
      'internal_christophe',
    );
    expect(response).toMatchSnapshot();
  });
});
