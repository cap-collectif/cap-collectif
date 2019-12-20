/* eslint-env jest */
const InternalQuery = /* GraphQL */ `
  query InternalQuery($proposalForm: ID!) {
    proposalForm: node(id: $proposalForm) {
      ... on ProposalForm {
        proposals(first: 10, orderBy: { field: COMMENTS, direction: DESC }) {
          edges {
            node {
              id
              comments {
                totalCount
              }
              createdAt
            }
          }
        }
      }
    }
  }
`;

describe('Internal|ProposalForm.proposals', () => {
  it('fetches proposals ordered by biggest number of comments', async () => {
    await expect(
      graphql(
        InternalQuery,
        {
          proposalForm: 'proposalform1',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});
