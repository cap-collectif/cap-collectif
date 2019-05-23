/* eslint-env jest */
const TIMEOUT = 15000;

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

describe('MultipleChoiceQuestion_choices', () => {
  test(
    "it resolves a question's choices and the number of answers to each of them",
    async () => {
      await expect(
        global.internalClient.request(MultipleChoiceQuestionChoicesQuery, {
          id: global.toGlobalId('Question', '13'),
        }),
      ).resolves.toMatchSnapshot('13');
    },
    TIMEOUT,
  );
});
