const QuestionResponsesCivicIAQuery = /** GraphQL */ `
  query QuestionResponsesCivicIAQuery($questionId: ID!) {
    question: node(id: $questionId) {
      ... on Question {
        responses {
          edges {
            node {
              ... on ValueResponse {
                iaCategory
                iaReadability
                iaSentiment
              }
            }
          }
        }
      }
    }
  }
`;

describe('Internal|Question.civicIA', () => {
  it('fail to get civicIA analysis if not admin', async () => {
    await expect(
      graphql(
        QuestionResponsesCivicIAQuery,
        {
          questionId: 2,
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('get civicIA analysis on responses', async () => {
    await expect(
      graphql(
        QuestionResponsesCivicIAQuery,
        {
          questionId: 2,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
