/* eslint-env jest */
import '../../_setup';

const AssignSupervisorToProposalsMutation = /* GraphQL*/ `
  mutation AssignSupervisorToProposalsMutation($input: AssignSupervisorToProposalsInput!) {
    assignSupervisorToProposals(input: $input) {
      errorCode
      proposals {
        totalCount
        edges {
        node {
            id
            title
            supervisor {
              username
              id
            }
          }
        }
      }
    }
  }
`;

describe('mutations.assignSupervisorToProposals', () => {
  // admin
  it('admin should assign a user as supervisor to a proposal.', async () => {
    const assignSupervisorToProposals = await graphql(
      AssignSupervisorToProposalsMutation,
      {
        input: {
          proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMTA='],
          supervisorId: global.toGlobalId('User', 'userMaxime'),
        },
      },
      'internal_admin',
    );
    expect(assignSupervisorToProposals).toMatchSnapshot();
  });

  it('admin should assign a user as supervisor to a list of proposals.', async () => {
    const assignSupervisorToProposals = await graphql(
      AssignSupervisorToProposalsMutation,
      {
        input: {
          proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMTA=', 'UHJvcG9zYWw6cHJvcG9zYWwxOA=='],
          supervisorId: 'VXNlcjpVc2VyNjk=',
        },
      },
      'internal_admin',
    );
    expect(assignSupervisorToProposals).toMatchSnapshot();
  });

  it('admin should change supervisor to proposal.', async () => {
    const assignNewSupervisorToProposals = await graphql(
      AssignSupervisorToProposalsMutation,
      {
        input: { proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMDk='], supervisorId: 'VXNlcjp1c2VyNQ==' },
      },
      'internal_admin',
    );
    expect(assignNewSupervisorToProposals).toMatchSnapshot();
  });

  it('admin should revoke supervisor to proposal.', async () => {
    const revokeSupervisorToProposals = await graphql(
      AssignSupervisorToProposalsMutation,
      {
        input: { proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMTQ='], supervisorId: null },
      },
      'internal_admin',
    );
    expect(revokeSupervisorToProposals).toMatchSnapshot();
  });

  // decision maker
  it('decision maker should assign a user as supervisor to proposals.', async () => {
    const assignDecisionMakerAsSupervisorToProposals = await graphql(
      AssignSupervisorToProposalsMutation,
      {
        input: {
          proposalIds: ['UG9ycG9zYWw6cHJvcG9zYWwxMTA=', 'UG9ycG9zYWw6cHJvcG9zYWwxMDk='],
          supervisorId: 'VXNlcjp1c2VyNg==',
        },
      },
      'internal_decision_maker',
    );

    expect(assignDecisionMakerAsSupervisorToProposals).toMatchSnapshot();
  });

  it('decision maker should revoke supervisor to proposal.', async () => {
    const revokeSupervisorToProposals = await graphql(
      AssignSupervisorToProposalsMutation,
      {
        input: {
          proposalIds: ['UG9ycG9zYWw6cHJvcG9zYWwxMTA=', 'UG9ycG9zYWw6cHJvcG9zYWwxMDk='],
          supervisorId: null,
        },
      },
      'internal_decision_maker',
    );

    expect(revokeSupervisorToProposals).toMatchSnapshot();
  });
  //
  it('simple user cant assign a user as supervisor to a proposal.', async () => {
    const userCantAssignSupervisorToProposals = await graphql(
      AssignSupervisorToProposalsMutation,
      {
        input: {
          proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMTA='],
          supervisorId: global.toGlobalId('User', 'userMaxime'),
        },
      },
      'internal_user',
    );
    expect(userCantAssignSupervisorToProposals).toMatchSnapshot();
  });

  it('simple user cant change supervisor to proposal.', async () => {
    const userCantAssignNewSupervisorToProposals = await graphql(
      AssignSupervisorToProposalsMutation,
      {
        input: { proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMDk='], supervisorId: 'VXNlcjp1c2VyNQ==' },
      },
      'internal_user',
    );
    expect(userCantAssignNewSupervisorToProposals).toMatchSnapshot();
  });

  it('simple user cant revoke supervisor to proposal.', async () => {
    const userCantRevokeSupervisorToProposals = await graphql(
      AssignSupervisorToProposalsMutation,
      {
        input: { proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMDk='], supervisorId: null },
      },
      'internal_user',
    );
    expect(userCantRevokeSupervisorToProposals).toMatchSnapshot();
  });
});
