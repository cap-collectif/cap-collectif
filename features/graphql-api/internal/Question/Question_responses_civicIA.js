const QuestionResponsesCivicIAQuery = /** GraphQL */ `
  query QuestionResponsesCivicIAQuery($questionId: ID!, $iaCategory: String, $sentimentFilter: CivicIASentiment, $orderBy: ResponsesOrder) {
    question: node(id: $questionId) {
      ... on Question {
        responses (iaSentiment: $sentimentFilter, iaCategory: $iaCategory, orderBy: $orderBy) {
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
          iaCategory: null,
          orderBy: null,
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
          iaCategory: null,
          orderBy: null,
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
          iaCategory: null,
          orderBy: null,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('get civicIA analysis on responses, ordered by readability', async () => {
    await expect(
      graphql(
        QuestionResponsesCivicIAQuery,
        {
          questionId: 2,
          sentimentFilter: null,
          iaCategory: null,
          orderBy: {
            field: 'READABILITY',
            direction: 'DESC',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('get civicIA analysis on responses, ordered by category', async () => {
    await expect(
      graphql(
        QuestionResponsesCivicIAQuery,
        {
          questionId: 2,
          sentimentFilter: null,
          iaCategory: null,
          orderBy: {
            field: 'CATEGORY',
            direction: 'ASC',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('get civicIA analysis on responses, filtered by category', async () => {
    await expect(
      graphql(
        QuestionResponsesCivicIAQuery,
        {
          questionId: 2,
          sentimentFilter: null,
          iaCategory: 'home',
          orderBy: null,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
