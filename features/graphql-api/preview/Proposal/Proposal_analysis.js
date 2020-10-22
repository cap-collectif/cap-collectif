const ProposalAnalysisPreviewData = /* GraphQL */ `
  query getProposalsAnalysisPreviewData($collectStepId: ID!) {
    node(id: $collectStepId) {
      ... on CollectStep {
        id
        proposals(first: 3) {
          edges {
            node {
              draft
              analyses {
                id
                estimatedCost
                state
                createdAt
                updatedAt
              }
              decision {
                id
                isApproved
                estimatedCost
                decisionMaker {
                  id
                }
                refusedReason {
                  id
                  name
                }
                post {
                  id
                  title
                }
              }
              assessment {
                id
                estimatedCost
                state
                officialResponse
                createdAt
                updatedAt
              }
            }
          }
        }
      }
    }
  }
`;

describe('Preview.proposals', () => {
  it("fetches proposal's related analysis data", async () => {
    await expect(
      graphql(
        ProposalAnalysisPreviewData,
        {
          collectStepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBJZGY=',
        },
        'admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
