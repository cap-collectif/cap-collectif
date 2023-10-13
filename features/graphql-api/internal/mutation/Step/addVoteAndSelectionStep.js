/* eslint-env jest */
import '../../../_setup';

const AddVoteAndSelectionStep = /* GraphQL*/ `
    mutation AddVoteAndSelectionStep($input: AddStepInput!) {
        addVoteAndSelectionStep(input: $input) {
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
                    allowAuthorsToAddNews
                    defaultSort
                    voteType
                    votesLimit
                }
            }
        }
    }
`;

describe('mutations.addVoteAndSelectionStepMutation', () => {
  it('admin should be able to add vote and selection step.', async () => {
    const response = await graphql(
      AddVoteAndSelectionStep,
      { input: { projectId: toGlobalId('Project', 'project9') } },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
  it('admin project should be able to add vote and selection step.', async () => {
    const response = await graphql(
      AddVoteAndSelectionStep,
      { input: { projectId: toGlobalId('Project', 'projectWithOwner') } },
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });
  it('orga member should be able to add vote and selection step.', async () => {
    const response = await graphql(
      AddVoteAndSelectionStep,
      { input: { projectId: toGlobalId('Project', 'projectOrgaVisibilityMe') } },
      'internal_christophe',
    );
    expect(response).toMatchSnapshot();
  });
});
