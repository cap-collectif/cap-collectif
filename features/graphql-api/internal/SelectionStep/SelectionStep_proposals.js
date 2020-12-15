//* eslint-env jest */
const SelectionStepProposalsQuery = /* GraphQL */ `
  query SelectionStepProposalsQuery($id: ID!, $userType: ID, $status: ID) {
    node(id: $id) {
      ... on SelectionStep {
        id
        title
        proposals(first: 5, userType: $userType, status: $status) {
          totalCount
          edges {
            node {
              status(step: $id) {
                id
                name
              }
              author {
                userType {
                  id
                  name
                }
              }
              title
            }
          }
        }
      }
    }
  }
`;

describe('Preview|SelectionStep.proposals', () => {
  it('fetches the proposals from a selection step with status 4 & type 1 filters', async () => {
    await expect(
      graphql(
        SelectionStepProposalsQuery,
        {
          id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ',
          userType: 1,
          status: 'status4',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the proposals from a selection step with status 5 & type 1 filters', async () => {
    await expect(
      graphql(
        SelectionStepProposalsQuery,
        {
          id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ',
          userType: 1,
          status: 'status5',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});
