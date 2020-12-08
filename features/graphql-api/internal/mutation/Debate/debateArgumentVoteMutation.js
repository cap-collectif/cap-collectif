/* eslint-env jest */

const AddDebateArgumentVoteMutation = /* GraphQL */ `
  mutation AddDebateArgumentVoteMutation($input: AddDebateArgumentVoteInput!) {
    addDebateArgumentVote(input: $input) {
      errorCode
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

const RemoveDebateArgumentVoteMutation = /* GraphQL */ `
  mutation RemoveDebateArgumentVoteMutation($input: RemoveDebateArgumentVoteInput!) {
    removeDebateArgumentVote(input: $input) {
      errorCode
      debateArgument {
        votes {
          totalCount
        }
        viewerHasVote
      }
      deletedDebateArgumentVoteId
    }
  }
`;

describe('Internal|AddDebateArgumentVoteMutation', () => {
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
  it('vote for an argument', async () => {
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
            debateArgumentId: toGlobalId('DebateArgument', 'debateArgument4'),
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
});

describe('Internal|RemoveDebateArgumentVoteMutation', () => {
  it('try to remove vote with wrong argument id', async () => {
    await expect(
      graphql(
        RemoveDebateArgumentVoteMutation,
        {
          input: {
            debateArgumentId: 'wrongId',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('remove vote for an argument', async () => {
    await expect(
      graphql(
        RemoveDebateArgumentVoteMutation,
        {
          input: {
            debateArgumentId: toGlobalId('DebateArgument', 'debateArgument4'),
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('try to remove nonexistent vote for an argument', async () => {
    await expect(
      graphql(
        RemoveDebateArgumentVoteMutation,
        {
          input: {
            debateArgumentId: toGlobalId('DebateArgument', 'debateArgument4'),
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
});
