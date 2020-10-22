/* eslint-env jest */
import '../../_setup';

const AssignAnalystsToProposalsMutation = /* GraphQL*/ `
  mutation AssignAnalystsToProposalsMutation($input: AssignAnalystsToProposalsInput!) {
    assignAnalystsToProposals(input: $input) {
      errorCode
      proposals {
        totalCount
        edges {
        node {
            id
            title
            analysts {
              username
            }
            analyses {
              analyst {
                username
              }
            }
          }
        }
      }
    }
  }
`;

describe('mutations.assignAnalystsToProposals', () => {
  // admin
  it('admin should assign a user as Analysts to a proposal.', async () => {
    const assignAnalystsToProposals = await graphql(
      AssignAnalystsToProposalsMutation,
      {
        input: { proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMTA='], analystIds: ['VXNlcjp1c2VyMzQ='] },
      },
      'internal_admin',
    );
    expect(assignAnalystsToProposals).toMatchSnapshot();
  });

  it('admin should assign a user as Analysts to a list of proposals.', async () => {
    const assignAnalystsToProposals = await graphql(
      AssignAnalystsToProposalsMutation,
      {
        input: {
          proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMTA=', 'UHJvcG9zYWw6cHJvcG9zYWwxOA=='],
          analystIds: ['VXNlcjp1c2VyMzQ='],
        },
      },
      'internal_admin',
    );
    expect(assignAnalystsToProposals).toMatchSnapshot();
  });

  it('should not assign more 10 users as Analysts to a proposal, logged as admin', async () => {
    const cantAssignMore10AnalystsToProposals = await graphql(
      AssignAnalystsToProposalsMutation,
      {
        input: {
          proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMTA='],
          analystIds: [
            'VXNlcjp1c2VyNTE2',
            'VXNlcjp1c2VyMjY=',
            'VXNlcjp1c2VyMjc=',
            'VXNlcjp1c2VyMjg=',
            'VXNlcjp1c2VyMjk=',
            'VXNlcjp1c2VyMzA=',
            'VXNlcjp1c2VyMzE=',
            'VXNlcjp1c2VyMzI=',
            'VXNlcjp1c2VyMzM=',
            'VXNlcjp1c2VyMzQ=',
            'VXNlcjp1c2VyMzU=',
            'VXNlcjp1c2VyMzY=',
          ],
        },
      },
      'internal_admin',
    );
    expect(cantAssignMore10AnalystsToProposals).toMatchSnapshot();
  });

  // decision maker
  it('should assign a user as Analysts to proposals, logged as decision maker.', async () => {
    const assignAnalystsToProposalsLoggedAsDecionMaker = await graphql(
      AssignAnalystsToProposalsMutation,
      {
        input: {
          proposalIds: ['UG9ycG9zYWw6cHJvcG9zYWwxMTA=', 'UG9ycG9zYWw6cHJvcG9zYWwxMDk='],
          analystIds: ['VXNlcjp1c2VyNg=='],
        },
      },
      'internal_decision_maker',
    );

    expect(assignAnalystsToProposalsLoggedAsDecionMaker).toMatchSnapshot();
  });

  it('should assign a user as Analysts to proposals, logged as supervisor', async () => {
    const assignAnalystsToProposalsLoggedAsSupervisor = await graphql(
      AssignAnalystsToProposalsMutation,
      {
        input: {
          proposalIds: ['UG9ycG9zYWw6cHJvcG9zYWwxMTA=', 'UG9ycG9zYWw6cHJvcG9zYWwxMDk='],
          analystIds: ['VXNlcjp1c2VyNg=='],
        },
      },
      'internal_supervisor',
    );

    expect(assignAnalystsToProposalsLoggedAsSupervisor).toMatchSnapshot();
  });

  it('should not assign a user as Analysts to a proposal, logged as user.', async () => {
    const assignAnalystsToProposalsLoggedAsUser = await graphql(
      AssignAnalystsToProposalsMutation,
      {
        input: { proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMTA='], analystIds: ['VXNlcjp1c2VyNTE2'] },
      },
      'internal_user',
    );
    expect(assignAnalystsToProposalsLoggedAsUser).toMatchSnapshot();
  });

  it('should assign a user as Analysts to a proposal, logged as analyst.', async () => {
    const assignAnalystsToProposalsLoggedAsUser = await graphql(
      AssignAnalystsToProposalsMutation,
      {
        input: {
          proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMTA='],
          analystIds: ['VXNlcjp1c2VyMjY='],
        },
      },
      'internal_analyst2',
    );
    expect(assignAnalystsToProposalsLoggedAsUser).toMatchSnapshot();
  });
});
