/* eslint-env jest */
const SelectionStepContributorsQuery = /* GraphQL */ `
  query SelectionStepContributorsQuery($id: ID!, $count: Int) {
    selectionStep: node(id: $id) {
      ... on SelectionStep {
        contributors(first: $count) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              _id
              createdAt
            }
          }
        }
      }
    }
  }
`;

describe('SelectionStep.contributors', () => {
  it(
    'returns the top 5 of contributors',
    async () => {
      await expect(
        graphql(
          SelectionStepContributorsQuery,
          { id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==', count: 5 },
          'internal',
        ),
      ).resolves.toMatchSnapshot();
    },
  );
});
