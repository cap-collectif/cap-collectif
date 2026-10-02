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
              paperVotesOnStep: paperVotes(stepId: $collectStepId) {
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
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
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
    ).resolves.toMatchSnapshot()
  })
})
