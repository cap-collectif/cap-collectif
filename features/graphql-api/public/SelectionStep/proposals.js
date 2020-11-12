/* eslint-env jest */

const ProposalsQuery = /* GraphQL */ `
  query OpenDataProposalsQuery(
    $id: ID!
    $count: Int!
    $cursor: String
    $trashedStatus: ProposalTrashedStatus
    $orderBy: ProposalOrder!
    $draft: Boolean
  ) {
    node(id: $id) {
      id
      ... on SelectionStep {
        proposals(
          trashedStatus: $trashedStatus
          orderBy: $orderBy
          first: $count
          after: $cursor
          includeDraft: $draft
        ) {
          totalCount
          edges {
            cursor
            node {
              id
              title
              draft
              publicationStatus
              revisions(state: PENDING) {
                totalCount
                edges {
                  node {
                    id
                    createdAt
                    author {
                      username
                    }
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
`;

describe('Preview|Query.proposals connection', () => {
  it('fetches proposals order by revision asc and revision state in pending', async () => {
    await expect(
      graphql(
        ProposalsQuery,
        {
          id: toGlobalId('SelectionStep', 'selectionStepIdfAnalyse'),
          count: 100,
          orderBy: { field: 'REVISION_AT', direction: 'ASC' },
          draft: false,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
