/* eslint-env jest */
import '../../_setup';

const revokeAnalystsToProposalsMutation = /* GraphQL*/ `
  mutation revokeAnalystsToProposalsMutation($input: RevokeAnalystsToProposalsInput!) {
    revokeAnalystsToProposals(input: $input) {
      errorCode
      proposals {
        totalCount
        edges {
          node {
            title
            analysts {
              username
              id
            }
            analyses {
              updatedBy {
                username
                id
              }
            }
          }
        }
      }
      viewer {
        isAdmin
        username
      }
    }
  }
`;

describe('mutations.revokeAnalystsToProposalsMutation', () => {
  it('should not revoke all analyst to a proposal, logged as decision maker.', async () => {
    const revokeAllAnalystToProposals2 = await graphql(
      revokeAnalystsToProposalsMutation,
      {
        input: { proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMDk='], analystIds: [] },
      },
      'internal_decision_maker',
    );
    expect(revokeAllAnalystToProposals2).toMatchSnapshot();
  });

  it('should not revoke all analyst to a proposal, logged as supervisor.', async () => {
    const revokeAllAnalystToProposals3 = await graphql(
      revokeAnalystsToProposalsMutation,
      {
        input: { proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMDk='], analystIds: [] },
      },
      'internal_supervisor',
    );
    expect(revokeAllAnalystToProposals3).toMatchSnapshot();
  });

  it('should revoke an analyst to a proposal, logged as decision maker.', async () => {
    const revokeAnalystToProposals = await graphql(
      revokeAnalystsToProposalsMutation,
      {
        input: { proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMDk='], analystIds: ['VXNlcjp1c2VyMjY='] },
      },
      'internal_decision_maker',
    );
    expect(revokeAnalystToProposals).toMatchSnapshot();
  });

  it('should revoke an analyst to a proposal, logged as supervisor.', async () => {
    const revokeAnalystToProposals = await graphql(
      revokeAnalystsToProposalsMutation,
      {
        input: { proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMDk='], analystIds: ['VXNlcjp1c2VyMjY='] },
      },
      'internal_supervisor',
    );
    expect(revokeAnalystToProposals).toMatchSnapshot();
  });

  it('should not revoke list analyst to a proposal, logged as decision maker.', async () => {
    const revokeAnalystToProposals = await graphql(
      revokeAnalystsToProposalsMutation,
      {
        input: {
          proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMDk='],
          analystIds: ['VXNlcjp1c2VyMjY=', 'VXNlcjp1c2VyQW5hbHlzdDI='],
        },
      },
      'internal_decision_maker',
    );
    expect(revokeAnalystToProposals).toMatchSnapshot();
  });

  it('should not revoke list analyst to a proposal, logged as supervisor.', async () => {
    const revokeAnalystToProposals = await graphql(
      revokeAnalystsToProposalsMutation,
      {
        input: {
          proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMDk='],
          analystIds: ['VXNlcjp1c2VyMjY=', 'VXNlcjp1c2VyQW5hbHlzdDI='],
        },
      },
      'internal_supervisor',
    );
    expect(revokeAnalystToProposals).toMatchSnapshot();
  });

  it('should revoke all analyst to a proposal, logged as user.', async () => {
    const revokeAllAnalystToProposals4 = await graphql(
      revokeAnalystsToProposalsMutation,
      {
        input: { proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMDk='], analystIds: [] },
      },
      'internal_user',
    );
    expect(revokeAllAnalystToProposals4).toMatchSnapshot();
  });
});
