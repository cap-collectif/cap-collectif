/* eslint-env jest */
const MultipleChoiceQuestionResponsesQuery = /* GraphQL */ `
  query MultipleChoiceQuestionResponsesQuery($id: ID!) {
    node(id: $id) {
      ... on MultipleChoiceQuestion {
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

describe('MultipleChoiceQuestion.responses array', () => {
  it(
    "fetches a multiple choice question's responses",
    async () => {
      await global.asyncForEach(
        ['13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27'],
        async id => {
          await expect(
            graphql(
              MultipleChoiceQuestionResponsesQuery,
              {
                id: global.toGlobalId('Question', id),
              },
              'internal',
            ),
          ).resolves.toMatchSnapshot(id);
        },
      );
    },
  );
});
