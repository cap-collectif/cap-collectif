/* eslint-env jest */
import '../../../_setup';

const RemoveDebateVoteMutation = /* GraphQL */ `
  mutation RemoveDebateVoteMutation($input: RemoveDebateVoteInput!) {
    removeDebateVote(input: $input) {
      errorCode
      deletedVoteId
      deletedArgumentId
      debate {
        id
        votes(isPublished: true) {
          totalCount
          edges {
            node {
              id
            }
          }
        }
        arguments(isPublished: true, isTrashed: false) {
          totalCount
          edges {
            node {
              id
            }
          }
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
    // TODO: Skipping test until we find a solution concerning the ES snapshot
    expect(response).toMatchSnapshot();
  });
});
