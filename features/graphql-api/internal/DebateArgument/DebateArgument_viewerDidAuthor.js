/* eslint-env jest */
const DebateArgumentViewerDidAuthorQuery = /* GraphQL */ `
  query DebateArgumentViewerDidAuthorQuery($id: ID!) {
    node(id: $id) {
      ... on DebateArgument {
        viewerDidAuthor
      }
    }
  }
`;

describe('Internal|Debate.viewerDidAuthor bool', () => {
  it('fetches if viewer is the argument author', async () => {
    await expect(
      graphql(
        DebateArgumentViewerDidAuthorQuery,
        {
          id: toGlobalId('DebateArgument', 'debateArgument1'),
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches if viewer is the argument author', async () => {
    await expect(
      graphql(
        DebateArgumentViewerDidAuthorQuery,
        {
          id: toGlobalId('DebateArgument', 'debateArgument1'),
        },
        'internal_spylou',
      ),
    ).resolves.toMatchSnapshot();
  });
});
