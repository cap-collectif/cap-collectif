/* eslint-env jest */
const DebateViewerUnpublishedArgumentQuery = /* GraphQL */ `
  query DebateViewerUnpublishedArgument($id: ID!) {
    debate: node(id: $id) {
      ... on Debate {
        viewerUnpublishedArgument {
          id
          published
        }
      }
    }
  }
`;

describe('Internal|Debate.viewerUnpublishedArgument', () => {
  const variables = {
    id: toGlobalId('Debate', 'debateCannabis'),
  };
  const notConfirmedUserClient = {
    email: 'userNotConfirmedWithContributions@test.com',
    password: 'userNotConfirmedWithContributions',
  };

  it('should return null when the user is anonymous', async () => {
    const { debate } = await graphql(DebateViewerUnpublishedArgumentQuery, variables, 'internal');
    expect(debate.viewerUnpublishedArgument).toBe(null);
  });

  it('should return null when a user does not have an unpublished argument', async () => {
    const { debate } = await graphql(
      DebateViewerUnpublishedArgumentQuery,
      variables,
      'internal_admin',
    );
    expect(debate.viewerUnpublishedArgument).toBe(null);
  });

  it('should return the unpublished argument for user_not_confirmed_with_contribution', async () => {
    const { debate } = await graphql(
      DebateViewerUnpublishedArgumentQuery,
      variables,
      notConfirmedUserClient,
    );
    expect(debate.viewerUnpublishedArgument).not.toBe(null);
    expect(debate.viewerUnpublishedArgument.published).toBe(false);
  });
});
