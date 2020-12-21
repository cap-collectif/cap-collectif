/* eslint-env jest */
const DebateViewerHasReportQuery = /* GraphQL */ `
  query DebateViewerHasReport($id: ID!) {
    node(id: $id) {
      ... on DebateArgument {
        viewerHasReport
      }
    }
  }
`;

describe('Internal|DebateArgument.viewerHasReport bool', () => {
  it('fetches if viewer has report an argument', async () => {
    await expect(
      graphql(
        DebateViewerHasReportQuery,
        {
          id: toGlobalId('DebateArgument', 'debateArgument4'),
        },
        'internal_spylou',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('fetches if viewer has report an argument', async () => {
    await expect(
      graphql(
        DebateViewerHasReportQuery,
        {
          id: toGlobalId('DebateArgument', 'debateArgument4'),
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
});
