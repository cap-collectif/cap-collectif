/* eslint-env jest */
import '../../_setup';

const assignDecisionMakerToProposalsMutation = /* GraphQL*/ `
  mutation ($input: AssignDecisionMakerToProposalsInput!) {
    assignDecisionMakerToProposals(input: $input) {
      errorCode
      proposals {
        totalCount
        edges {
          node {
            id
            title
            decisionMaker {
              id
              username
            }
          }
        }
      }
    }
  }
`;

describe('mutations.assignDecisionMakerToProposals', () => {
  // admin
  it('admin should assign a user as decision maker to a proposal.', async () => {
    const assignDecisionMakerToProposals = await graphql(
      assignDecisionMakerToProposalsMutation,
      {
        input: {
          proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMTA='],
          decisionMakerId: 'VXNlcjp1c2VyTWF4aW1l',
        },
      },
      'internal_admin',
    );
    expect(assignDecisionMakerToProposals).toMatchSnapshot();
  });

  it('admin should assign a user as decision maker to a list of proposals.', async () => {
    const assignDecisionMakerToListOfProposals = await graphql(
      assignDecisionMakerToProposalsMutation,
      {
        input: {
          proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMTA=', 'UHJvcG9zYWw6cHJvcG9zYWwxOA=='],
          decisionMakerId: 'VXNlcjpVc2VyNjk=',
        },
      },
      'internal_admin',
    );
    expect(assignDecisionMakerToListOfProposals).toMatchSnapshot();
  });

  it('admin should change decision maker to proposal.', async () => {
    const assignNewDecisionMakerToProposals = await graphql(
      assignDecisionMakerToProposalsMutation,
      {
        input: {
          proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMDk='],
          decisionMakerId: 'VXNlcjp1c2VyNQ==',
        },
      },
      'internal_admin',
    );
    expect(assignNewDecisionMakerToProposals).toMatchSnapshot();
  });

  it('admin should revoke decision maker to proposal.', async () => {
    const revokeDecisionMakerToProposals = await graphql(
      assignDecisionMakerToProposalsMutation,
      {
        input: { proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMTA='], decisionMakerId: null },
      },
      'internal_admin',
    );
    expect(revokeDecisionMakerToProposals).toMatchSnapshot();
  });
});
