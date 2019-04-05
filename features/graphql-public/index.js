/* eslint-env jest */
import 'babel-polyfill';
import 'whatwg-fetch';

const GraphQLClient = require('graphql-request').GraphQLClient;

const endpoint = 'https://capco.test/graphql';
const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: 'Bearer iamthetokenofadmin',
    accept: 'application/vnd.cap-collectif.preview+json',
  },
});

const TIMEOUT = 15000;

const OpenDataRepliesQuery = /* GraphQL */ `query OpenDataRepliesQuery($id: ID!, $count: Int!, $cursor: String)
{
  node(id: $id) {
    ... on Questionnaire {
      replies(first: $count, after: $cursor) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            createdAt
            publishedAt
            updatedAt
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
                  }
                  ... on MediaResponse {
                    medias {
                      url
                    }
                  }
            }
          }
        }
      }
    }
  }
}`;

const OpenDataProposalsQuery = /* GraphQL */ `
    query OpenDataProposalsQuery($id: ID!, $count: Int!, $cursor: String, $trashedStatus: ProposalTrashedStatus, $orderBy: ProposalOrder!)
    {
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
const ViewerQuery = /* GraphQL */ `
query ViewerQuery
{
  viewer {
    id
    username
  }
}`;

// eslint-disable-next-line no-unused-vars
const OpenDataEventsQuery = /* GraphQL */ `query OpenDataEventsQuery ($count: Int!, $cursor: String)
      {
        events(first: $count, after: $cursor) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                title
                createdAt
                updatedAt
                startAt
                endAt
                enabled
                fullAddress
                lat
                lng
                zipCode
                body
                url
                link
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
                          formattedValue
                        }
                      }
                    }
                  }
                }
              }
            }
          }
      }
    `;

describe('GraphQL API', () => {
  it(
    'ViewerQuery',
    async () => {
      await expect(client.request(ViewerQuery)).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );

  it(
    'OpenDataRepliesQuery',
    async () => {
      await expect(
        client.request(OpenDataRepliesQuery, {
          id: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==',
          count: 100,
        }),
      ).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );

  it(
    'OpenDataProposalsQuery',
    async () => {
      await expect(
        client.request(OpenDataProposalsQuery, {
          id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
          count: 100,
          orderBy: { field: 'PUBLISHED_AT', direction: 'ASC' },
        }),
      ).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );

  // TODO https://github.com/cap-collectif/platform/issues/7544
  // it(
  //   'OpenDataEventsQuery',
  //   async () => {
  //     const data = await client.request(OpenDataEventsQuery, { count: 100 });
  //     console.log(expect);
  //     data.events.edges.forEach((edge) => {
  //       expect(edge.node).toMatchSnapshot({
  //         createdAt: expect.any(String),
  //         startAt: expect.any(String),
  //         // endAt: expect.toBeNull(),
  //         updatedAt: expect.any(String),
  //       })
  //     });
  //   },
  //   TIMEOUT,
  // );
});
