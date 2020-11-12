/* eslint-env jest */
import '../../_setup';

const AskProposalRevisionMutation = /* GraphQL*/ `
  mutation askProposalRevision($input: AskProposalRevisionInput!) {
    askProposalRevision(input: $input) {
      errorCode
      proposal {
        id
        revisions(state: PENDING) {
          edges {
            node {
              author {
                username
              }
              state
              reason
              expiresAt
            }
          }
        }
      }
    }
  }
`;
const DENIED_ERROR_MESSAGE = 'Access denied to this field.';

describe('mutations.askProposalRevision', () => {
  // admin
  it('admin should ask a revision on proposal.', async () => {
    const askProposalRevisionMutation = await graphql(
      AskProposalRevisionMutation,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'proposalIdf1'),
          reason: 'Le champs cout est incomplet !',
          expiresAt: '2030-11-14 11:59:30',
        },
      },
      'internal_admin',
    );
    expect(askProposalRevisionMutation).toMatchSnapshot();
  });
  it('admin should ask a revision on proposal,even if date expires after analyse step end.', async () => {
    const askProposalRevisionMutation = await graphql(
      AskProposalRevisionMutation,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'proposalIdf1'),
          reason: 'Le champs cout est incomplet !',
          expiresAt: '2130-11-14 11:59:30',
        },
      },
      'internal_admin',
    );
    expect(askProposalRevisionMutation).toMatchSnapshot();
  });
  // user
  it('user should not ask a revision on proposal.', async () => {
    await expect(
      graphql(
        AskProposalRevisionMutation,
        {
          input: {
            proposalId: toGlobalId('Proposal', 'proposalIdf1'),
            reason: 'Le champs cout est incomplet !',
            expiresAt: '2030-11-14 11:59:30',
          },
        },
        'internal_user',
      ),
    ).rejects.toThrowError(DENIED_ERROR_MESSAGE);
  });
  // anonym
  it('anonym should not ask a revision on proposal.', async () => {
    await expect(
      graphql(
        AskProposalRevisionMutation,
        {
          input: {
            proposalId: toGlobalId('Proposal', 'proposalIdf1'),
            reason: 'Le champs cout est incomplet !',
            expiresAt: '2030-11-14 11:59:30',
          },
        },
        'internal',
      ),
    ).rejects.toThrowError(DENIED_ERROR_MESSAGE);
  });
});
