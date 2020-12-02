const ProposalDecisionQuery = /* GraphQL */ `
  query getDecisionOnProposal($id: ID!) {
    proposal: node(id: $id) {
      ... on Proposal {
        assessment {
          state
          estimatedCost
        }
        decision {
          isApproved
          state
          refusedReason {
            id
          }
          estimatedCost
          post {
            id
            body
            authors {
              id
            }
          }
        }
        viewerCanDecide
        viewerCanEvaluate
      }
    }
  }
`;

describe('Proposal.decision', () => {
  it("fetches proposal's decision when authenticated as decision-maker.", async () => {
    await expect(
      graphql(
        ProposalDecisionQuery,
        {
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMTM=',
        },
        'internal_decision_maker',
      ),
    ).resolves.toMatchSnapshot();
  });

  it("does not fetches proposal's decision when authenticated as user", async () => {
    await expect(
      graphql(
        ProposalDecisionQuery,
        {
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMTM=',
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });

  it("fetches proposal's decision when authenticated as supervisor who's not assigned to the proposal", async () => {
    await expect(
      graphql(
        ProposalDecisionQuery,
        {
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMTM=',
        },
        'internal_supervisor',
      ),
    ).resolves.toMatchSnapshot();
  });

  it("fetches proposal's decision when authenticated as supervisor", async () => {
    await expect(
      graphql(
        ProposalDecisionQuery,
        {
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMTM=',
        },
        'internal_supervisor2',
      ),
    ).resolves.toMatchSnapshot();
  });

  it("fetches proposal's decision when authenticated as administrator", async () => {
    await expect(
      graphql(
        ProposalDecisionQuery,
        {
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMTM=',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
