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
            cursor
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

const ProposalsWithDraftQuery = /* GraphQL */ `
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
      ... on CollectStep {
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

describe('Query.proposals connection', () => {
  it(
    'fetches the first hundred proposals with a cursor',
    async () => {
      await expect(
        graphql(OpenDataProposalsQuery, {
          id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
          count: 100,
          orderBy: { field: 'PUBLISHED_AT', direction: 'ASC' },
        }),
      ).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );

  it(
    'fetches the first hundred proposals (including drafted) with a cursor',
    async () => {
      await expect(
        graphql(
          ProposalsWithDraftQuery,
          {
            id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
            count: 100,
            orderBy: { field: 'PUBLISHED_AT', direction: 'ASC' },
            draft: true,
          },
          'internal',
        ),
      ).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );
});
