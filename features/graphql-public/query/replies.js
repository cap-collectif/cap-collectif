/* eslint-env jest */
const TIMEOUT = 15000;

const OpenDataRepliesQuery = /* GraphQL */ `
  query OpenDataRepliesQuery($id: ID!, $count: Int!, $cursor: String) {
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
  }
`;

describe('GraphQL API', () => {
  test(
    'OpenDataRepliesQuery',
    async () => {
      await expect(
        global.client.request(OpenDataRepliesQuery, {
          id: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==',
          count: 100,
        }),
      ).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );
});
