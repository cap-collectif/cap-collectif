const ProposalVotesPreviewData = /* GraphQL */ `
  query ProposalVotesPreviewData($collectStepId: ID!) {
    node(id: $collectStepId) {
      ... on CollectStep {
        id
        proposals(first: 100) {
          edges {
            node {
              id
              votes(first: 100) {
                totalCount
                edges {
                  node {
                    id
                    createdAt
                    published
                    notPublishedReason
                    publishedAt
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

describe('Preview.Proposal_votes', () => {
  it("fetches votes's related to a proposal", async () => {
    await expect(
      graphql(
        ProposalVotesPreviewData,
        {
          collectStepId: toGlobalId('CollectStep', 'collectstep5'),
        },
        'preview',
      ),
    ).resolves.toMatchSnapshot();
  });
});
