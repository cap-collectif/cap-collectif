/* eslint-env jest */
const DebateViewerUnpublishedVotesQuery = /* GraphQL */ `
  query DebateViewerUnpublishedVotes($id: ID!) {
    debate: node(id: $id) {
      ... on Debate {
        viewerUnpublishedVotes(first: 10) {
          edges {
            node {
              ... on DebateVote {
                author {
                  email
                }
              }
              published
            }
          }
        }
      }
    }
  }
`;

const CountDebateViewerUnpublishedVotesQuery = /* GraphQL */ `
  query CountDebateViewerUnpublishedVotes($id: ID!) {
    debate: node(id: $id) {
      ... on Debate {
        viewerUnpublishedVotes(first: 0) {
          totalCount
        }
      }
    }
  }
`;

describe('Internal|Debate.viewerUnpublishedVotes', () => {
  const variables = {
    id: toGlobalId('Debate', 'debateCannabis'),
  };
  const notConfirmedUserClient = {
    email: 'userNotConfirmedWithContributions@test.com',
    password: 'userNotConfirmedWithContributions',
  };

  it('should return null when the user is anonymous', async () => {
    const { debate } = await graphql(DebateViewerUnpublishedVotesQuery, variables, 'internal');
    expect(debate).toBe(null);
  });

  it('should return the unpublished votes for user_not_confirmed_with_contribution', async () => {
    const { debate } = await graphql(
      DebateViewerUnpublishedVotesQuery,
      variables,
      notConfirmedUserClient,
    );
    const votes = debate.viewerUnpublishedVotes.edges.map(edge => edge.node);
    expect(votes.every(vote => vote.published === false)).toBe(true);
    expect(votes.every(vote => vote.author.email === notConfirmedUserClient.email)).toBe(true);
  });

  it('should return the correct unpublished votes count for userNotConfirmedWithContributions', async () => {
    await expect(
      graphql(CountDebateViewerUnpublishedVotesQuery, variables, notConfirmedUserClient),
    ).resolves.toMatchSnapshot();
  });
});
