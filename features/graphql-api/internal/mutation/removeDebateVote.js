/* eslint-env jest */
import '../../_setup';

const RemoveDebateVoteMutation = /* GraphQL */ `
  mutation RemoveDebateVoteMutation($input: RemoveDebateVoteInput!) {
    removeDebateVote(input: $input) {
      errorCode
      deletedVoteId
      debate {
        id
        votes {
          totalCount
        }
      }
    }
  }
`;

describe('Internal|RemoveDebateVote mutation', () => {
  it('Remove a debate vote.', async () => {
    const response = await graphql(
      RemoveDebateVoteMutation,
      {
        input: {
          debateId: toGlobalId('Debate', 'debateCannabis'),
        },
      },
      'internal_spylou',
    );
    expect(response).toMatchSnapshot();
  });
});
