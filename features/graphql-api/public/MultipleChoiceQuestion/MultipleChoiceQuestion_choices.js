/* eslint-env jest */
const MultipleChoiceQuestionChoicesQuery = /* GraphQL */ `
  query MultipleChoiceQuestionQuery($id: ID!) {
    node(id: $id) {
      ... on MultipleChoiceQuestion {
        choices(allowRandomize: false) {
          edges {
            node {
              title
              responses {
                totalCount
              }
            }
          }
        }
      }
    }
  }
`;

const PaginatedMultipleChoiceQuestionChoicesQuery = /* GraphQL */ `
  query PaginatedMultipleChoiceQuestionChoicesByTermQuery(
    $id1: ID!
    $id2: ID!
    $term: String
    $cursor: String
    $limit: Int
  ) {
    q1: node(id: $id1) {
      ... on MultipleChoiceQuestion {
        choices(first: $limit, term: $term) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    }
    q1Bis: node(id: $id2) {
      ... on MultipleChoiceQuestion {
        choices(after: $cursor, term: $term, first: $limit) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    }
  }
`;

describe('MultipleChoiceQuestion.choices array', () => {
  it("fetches a question's choices and the number of answers to each of them", async () => {
    await expect(
      graphql(
        MultipleChoiceQuestionChoicesQuery,
        {
          id: toGlobalId('Question', '13'),
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it("fetches a question's choices that match the given term and paginate the results", async () => {
    await expect(
      graphql(
        PaginatedMultipleChoiceQuestionChoicesQuery,
        {
          id1: toGlobalId('Question', '3916'),
          id2: toGlobalId('Question', '3916'),
          term: 'sku',
          limit: 1,
          cursor: 'YToyOntpOjA7ZDozLjgzMjM5ODc7aToxO3M6MTY6InF1ZXN0aW9uY2hvaWNlNDQiO30=',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it("fetches a question's choices and paginate the results", async () => {
    await expect(
      graphql(
        PaginatedMultipleChoiceQuestionChoicesQuery,
        {
          id1: toGlobalId('Question', '3916'),
          id2: toGlobalId('Question', '3916'),
          term: '',
          limit: 5,
          cursor: 'YToyOntpOjA7ZDo0MjtpOjE7czoxNjoicXVlc3Rpb25jaG9pY2U0MiI7fQ==',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});
