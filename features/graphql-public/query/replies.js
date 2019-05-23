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
            cursor
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

describe('Questionnaire.replies connection', () => {
  it(
    'fetches the first hundred replies with a cursor',
    async () => {
      await expect(
        graphql(OpenDataRepliesQuery, {
          id: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==',
          count: 100,
        }),
      ).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );
});
