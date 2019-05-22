/* eslint-env jest */
const TIMEOUT = 15000;

const MediaQuestionResponsesQuery = /* GraphQL */ `
  query MediaQuestionResponsesQuery($id: ID!) {
    node(id: $id) {
      ... on MediaQuestion {
        responses(withNotConfirmedUser: true) {
          totalCount
          edges {
            node {
              ... on MediaResponse {
                medias {
                  id
                  url
                }
              }
            }
          }
        }
      }
    }
  }
`;

describe('MediaQuestion.responses array', () => {
  it(
    "it fetches a media question's responses",
    async () => {
      await Promise.all(
        ['11', '12'].map(async id => {
          await expect(
            graphql(
              MediaQuestionResponsesQuery,
              {
                id: global.toGlobalId('Question', id),
              },
              'internal',
            ),
          ).resolves.toMatchSnapshot(id);
        }),
      );
    },
    TIMEOUT,
  );
});
