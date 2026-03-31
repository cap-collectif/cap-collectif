/* eslint-env jest */
import '../../../_setupES'

const SelectionStepContributorsQuery = /* GraphQL */ `
  query SelectionStepContributorsQuery($id: ID!, $count: Int) {
    selectionStep: node(id: $id) {
      ... on SelectionStep {
        contributors(first: $count) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              ... on User {
                _id
              }
              createdAt
            }
          }
        }
      }
    }
  }
`

describe('SelectionStep.contributors', () => {
  it('returns the top 5 of contributors', async () => {
    const response = await graphql(
      SelectionStepContributorsQuery,
      { id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==', count: 5 },
      'internal',
    )

    expect({
      ...response,
      selectionStep: {
        ...response.selectionStep,
        contributors: {
          ...response.selectionStep.contributors,
          pageInfo: {
            ...response.selectionStep.contributors.pageInfo,
            endCursor: '<opaque-cursor>',
          },
        },
      },
    }).toMatchSnapshot()
  })
})
