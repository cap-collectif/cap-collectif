/* eslint-env jest */
const TIMEOUT = 15000;

const SimpleQuestionResponsesQuery = /* GraphQL */ `
  query SimpleQuestionResponsesQuery($id: ID!) {
    node(id: $id) {
      ... on SimpleQuestion {
        responses(withNotConfirmedUser: true) {
          totalCount
          edges {
            node {
              ... on ValueResponse {
                value
              }
            }
          }
        }
      }
    }
  }
`;

describe('SimpleQuestion_responses', () => {
  test(
    "it resolves a simple question's responses",
    async () => {
      await Promise.all(
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '666', '1313', '1314', '1315'].map(
          async id => {
            await expect(
              global.internalClient.request(SimpleQuestionResponsesQuery, {
                id: global.toGlobalId('Question', id),
              }),
            ).resolves.toMatchSnapshot(id);
          },
        ),
      );
    },
    TIMEOUT,
  );
});
