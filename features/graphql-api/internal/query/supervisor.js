const SupervisedProposalsQuery = /* GraphQL */ `
  query SupervisedProposalsQuery($id: ID!) {
    user: node(id: $id) {
      ... on User {
        supervisedProposals {
          edges {
            node {
              id
              assessment {
                state
                estimatedCost
                body
                officialResponse
              }
            }
          }
        }
      }
    }
  }
`;

describe('User.supervisedProposals', () => {
  it("fetches user's supervised proposals when authenticated as supervisor.", async () => {
    await expect(
      graphql(
        SupervisedProposalsQuery,
        {
          id: 'VXNlcjp1c2VyNTIz',
        },
        'internal_supervisor',
      ),
    ).resolves.toMatchSnapshot();
  });

  it("does not fetches user's supervised proposals when authenticated as user", async () => {
    await expect(
      graphql(
        SupervisedProposalsQuery,
        {
          id: 'VXNlcjp1c2VyNTIz',
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
});

const ProposalSupervisorRelatedQuery = /* GraphQL */ `
  query ProposalSupervisorRelatedQuery($id: ID!) {
    proposal: node(id: $id) {
      ... on Proposal {
        supervisor {
          id
          firstname
          lastname
        }
        assessment {
          body
          officialResponse
          state
          estimatedCost
        }
        viewerCanEvaluate
      }
    }
  }
`;

describe('Proposal.supervisor|assessment|viewerCanEvaluate', () => {
  it("fetches proposal's supervisor|assessment|viewerCanEvaluate authenticated as supervisor", async () => {
    await expect(
      graphql(
        ProposalSupervisorRelatedQuery,
        {
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=',
        },
        'internal_supervisor',
      ),
    ).resolves.toMatchSnapshot();
  });

  it("fetches proposal's supervisor|assessment|viewerCanEvaluate authenticated as user.", async () => {
    await expect(
      graphql(
        ProposalSupervisorRelatedQuery,
        {
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=',
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
});
