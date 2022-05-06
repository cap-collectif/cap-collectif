const QuestionResponsesCivicIAQuery = /** GraphQL */ `
  query QuestionResponsesCivicIAQuery($questionId: ID!, $sentimentFilter: CivicIASentiment) {
    question: node(id: $questionId) {
      ... on Question {
        responses (iaSentiment: $sentimentFilter) {
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
          sentimentFilter: null,
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
          sentimentFilter: null,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('get civicIA analysis on negative responses', async () => {
    await expect(
      graphql(
        QuestionResponsesCivicIAQuery,
        {
          questionId: 2,
          sentimentFilter: 'NEGATIVE',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
