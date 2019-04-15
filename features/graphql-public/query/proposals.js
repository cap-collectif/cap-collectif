/* eslint-env jest */
const TIMEOUT = 15000;

const OpenDataProposalsQuery = /* GraphQL */ `
  query OpenDataProposalsQuery(
    $id: ID!
    $count: Int!
    $cursor: String
    $trashedStatus: ProposalTrashedStatus
    $orderBy: ProposalOrder!
  ) {
    node(id: $id) {
      id
      ... on CollectStep {
        proposals(trashedStatus: $trashedStatus, orderBy: $orderBy, first: $count, after: $cursor) {
          totalCount
          edges {
            node {
              id
              reference
              title
              createdAt
              publishedAt
              updatedAt
              trashed
              trashedStatus
              author {
                id
                userType {
                  name
                }
                responses {
                  edges {
                    node {
                      ... on ValueResponse {
                        value
                      }
                    }
                  }
                }
              }
              responses {
                question {
                  id
                  title
                  __typename
                }
                ... on ValueResponse {
                  value
                  formattedValue
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

describe('OpenDataProposalsQuery', () => {
  test(
    'OpenDataProposalsQuery',
    async () => {
      await expect(
        global.client.request(OpenDataProposalsQuery, {
          id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
          count: 100,
          orderBy: { field: 'PUBLISHED_AT', direction: 'ASC' },
        }),
      ).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );
});
