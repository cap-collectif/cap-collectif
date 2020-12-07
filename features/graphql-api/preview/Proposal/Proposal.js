const ProposaPreviewData = /* GraphQL */ `
  query ProposaPreviewDataQuery($collectStepId: ID!) {
    node(id: $collectStepId) {
      ... on CollectStep {
        id
        proposals(first: 3) {
          edges {
            node {
              id
              body
              bodyText
              summary
              address {
                formatted
              }
            }
          }
        }
      }
    }
  }
`;

describe('Preview.proposals', () => {
  it("fetches proposal's data", async () => {
    await expect(
      graphql(
        ProposaPreviewData,
        {
          collectStepId: toGlobalId('CollectStep', 'collectstep1'),
        },
        'preview',
      ),
    ).resolves.toMatchSnapshot();
  });
});
