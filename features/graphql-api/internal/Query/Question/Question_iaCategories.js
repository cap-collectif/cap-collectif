const QuestionIaCategoriesQuery = /** GraphQL */ `
  query QuestionIaCategoriesQuery($questionId: ID!, $limit: Int) {
    question: node(id: $questionId) {
      ... on Question {
        iaCategories (limit: $limit) {
          value
          counter
        }
      }
    }
  }
`

describe('Internal|Question.iaCategories', () => {
  it('fail to get iaCategories if not admin', async () => {
    await expect(
      graphql(
        QuestionIaCategoriesQuery,
        {
          questionId: 2,
          limit: null,
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('get iaCategories', async () => {
    await expect(
      graphql(
        QuestionIaCategoriesQuery,
        {
          questionId: 2,
          limit: null,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('get 2 most used iaCategories', async () => {
    await expect(
      graphql(
        QuestionIaCategoriesQuery,
        {
          questionId: 2,
          limit: 2,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
