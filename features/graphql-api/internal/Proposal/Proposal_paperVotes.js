const ProposalPaperVotesData = /* GraphQL */ `
  query ProposalPaperVotesDataQuery($collectStepId: ID!, $projectId: ID!) {
    node(id: $projectId) {
      ... on Project {
        id
        proposals {
          edges {
            node {
              id
              paperVotesTotalCount
              votesOnStep: paperVotesTotalCount(stepId: $collectStepId)
              paperVotesTotalPointsCount
              pointsOnStep: paperVotesTotalPointsCount(stepId: $collectStepId)
              paperVotes {
                proposal {
                  id
                }
                step {
                  id
                }
                totalCount
                totalPointsCount
              }
            }
          }
        }
      }
    }
  }
`;

describe('Internal.proposals', () => {
  it("fetches proposal's paper votes", async () => {
    await expect(
      graphql(
        ProposalPaperVotesData,
        {
          projectId: toGlobalId('Project', 'projectWithOwner'),
          collectStepId: toGlobalId('CollectStep', 'collectStepProjectWithOwner'),
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});
