//* eslint-env jest */
const CollectStepProposalsArchivedQuery = /* GraphQL */ `
  query CollectStepProposalsArchivedQuery($id: ID!, $state: ProposalsState) {
    node(id: $id) {
      ... on CollectStep {
        id
        title
        proposals(state: $state) {
          edges {
            node {
              title
              isArchived
              published
            }
          }
        }
      }
    }
  }
`;

describe('Internal|CollectStep.proposals connection', () => {
  it('fetches archived proposals of a collect step', async () => {
    await expect(
      graphql(
        CollectStepProposalsArchivedQuery,
        {
          "id": "Q29sbGVjdFN0ZXA6Y29sbGVjdFN0ZXBQcm9wb3NhbEFyY2hpdmluZw==",
          "state": "ARCHIVED"
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('fetches archived and non archived proposals of a collect step', async () => {
    await expect(
      graphql(
        CollectStepProposalsArchivedQuery,
        {
          "id": "Q29sbGVjdFN0ZXA6Y29sbGVjdFN0ZXBQcm9wb3NhbEFyY2hpdmluZw==",
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('fetches non archived proposals of a collect step', async () => {
    await expect(
      graphql(
        CollectStepProposalsArchivedQuery,
        {
          "id": "Q29sbGVjdFN0ZXA6Y29sbGVjdFN0ZXBQcm9wb3NhbEFyY2hpdmluZw==",
          "state": "PUBLISHED"
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});
