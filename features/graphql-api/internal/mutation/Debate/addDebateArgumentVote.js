/* eslint-env jest */
import '../../../_setup';

const AddDebateArgumentVoteMutation = /* GraphQL */ `
  mutation AddDebateArgumentVoteMutation($input: AddDebateArgumentVoteInput!) {
    addDebateArgumentVote(input: $input) {
      errorCode
      debateArgumentVote {
        published
      }
      debateArgument {
        votes {
          edges {
            node {
              author {
                id
              }
            }
          }
          totalCount
        }
        viewerHasVote
      }
    }
  }
`;

describe('Internal|Mutation.addDebateArgumentVote', () => {
  it('try to vote with wrong argument id', async () => {
    await expect(
      graphql(
        AddDebateArgumentVoteMutation,
        {
          input: {
            debateArgumentId: 'wrongId',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('vote for a debate argument', async () => {
    await expect(
      graphql(
        AddDebateArgumentVoteMutation,
        {
          input: {
            debateArgumentId: toGlobalId('DebateArgument', 'debateArgument4'),
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('try to vote for an argument but already voted', async () => {
    await expect(
      graphql(
        AddDebateArgumentVoteMutation,
        {
          input: {
            debateArgumentId: toGlobalId('DebateArgument', 'debateArgument2'),
          },
        },
        'internal_spylou',
      ),
    ).resolves.toMatchSnapshot();
  });
});
