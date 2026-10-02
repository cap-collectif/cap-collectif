const QuestionTagCloudQuery = /** GraphQL */ `
  query QuestionTagCloudQuery($questionId: ID!, $term: String) {
    question: node(id: $questionId) {
      ...on SimpleQuestion {
        tagCloud(size: 2) {
          value
          occurrencesCount
        }
        responses(term: $term) {
          edges {
            node {
              ... on ValueResponse {
                formattedValue
              }
            }
          }
        }
      }
      ... on MultipleChoiceQuestion {
        tagCloud(size: 2) {
          value
          occurrencesCount
        }
        responses(term: $term) {
          edges {
            node {
              ... on ValueResponse {
                formattedValue
              }
            }
          }
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Question.tagCloud', () => {
  it('does fetch tag cloud data from question', async () => {
    await expect(
      graphql(
        QuestionTagCloudQuery,
        {
          questionId: 15,
          term: 'sonotone',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
