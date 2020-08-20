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
    $id: ID!
    $term: String
    $cursor: String
    $limit: Int
  ) {
    question: node(id: $id) {
      ... on MultipleChoiceQuestion {
        choices(after: $cursor, term: $term, first: $limit) {
          totalCount
          edges {
            node {
              id
              title
            }
          }
          pageInfo {
            startCursor
            endCursor
            hasNextPage
            hasPreviousPage
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
    const variables = {
      id: toGlobalId('Question', '3916'),
      term: 'sku',
      limit: 1,
      cursor: null,
    };
    const response1 = await graphql(
      PaginatedMultipleChoiceQuestionChoicesQuery,
      variables,
      'internal',
    );
    const endCursor = response1.question.choices.pageInfo.endCursor;
    expect(response1.question.choices.pageInfo.hasNextPage).toBe(true);
    expect(response1.question.choices.edges).toMatchSnapshot();
    const response2 = await graphql(
      PaginatedMultipleChoiceQuestionChoicesQuery,
      { ...variables, cursor: endCursor },
      'internal',
    );
    expect(response2.question.choices.pageInfo.hasNextPage).toBe(false);
    expect(response2.question.choices.edges).toMatchSnapshot();
  });

  it("fetches a question's choices and paginate the results", async () => {
    const variables = {
      id: toGlobalId('Question', '3916'),
      term: null,
      limit: 10,
      cursor: null,
    };
    const response1 = await graphql(
      PaginatedMultipleChoiceQuestionChoicesQuery,
      variables,
      'internal',
    );
    const endCursor = response1.question.choices.pageInfo.endCursor;
    expect(response1.question.choices.pageInfo.hasNextPage).toBe(true);
    expect(response1.question.choices.edges).toMatchSnapshot();
    const response2 = await graphql(
      PaginatedMultipleChoiceQuestionChoicesQuery,
      { ...variables, cursor: endCursor },
      'internal',
    );
    expect(response2.question.choices.pageInfo.hasNextPage).toBe(false);
    expect(response2.question.choices.edges).toMatchSnapshot();
  });
});
