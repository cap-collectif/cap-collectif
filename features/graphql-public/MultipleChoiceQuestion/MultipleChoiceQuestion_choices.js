/* eslint-env jest */
const MultipleChoiceQuestionChoicesQuery = /* GraphQL */ `
  query MultipleChoiceQuestionQuery($id: ID!) {
    node(id: $id) {
      ... on MultipleChoiceQuestion {
        choices(allowRandomize: false) {
          title
          responses {
            totalCount
          }
        }
      }
    }
  }
`;

describe('MultipleChoiceQuestion.choices array', () => {
  it(
    "fetches a question's choices and the number of answers to each of them",
    async () => {
      await expect(
        graphql(
          MultipleChoiceQuestionChoicesQuery,
          {
            id: global.toGlobalId('Question', '13'),
          },
          'internal',
        ),
      ).resolves.toMatchSnapshot('13');
    },
  );
});
