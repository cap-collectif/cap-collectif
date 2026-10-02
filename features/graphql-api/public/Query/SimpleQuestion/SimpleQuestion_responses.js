/* eslint-env jest */

const SimpleQuestionResponsesQuery = /* GraphQL */ `
  query SimpleQuestionResponsesQuery($id: ID!) {
    node(id: $id) {
      ... on SimpleQuestion {
        responses(withNotConfirmedUser: true) {
          totalCount
          edges {
            node {
              ... on ValueResponse {
                value
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
describe('SimpleQuestion.responses array', () => {
  it("fetches a simple question's responses", async () => {
    await Promise.all(
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '666', '1313', '1314', '1315'].map(async id => {
        await expect(
          graphql(
            SimpleQuestionResponsesQuery,
            {
              id: global.toGlobalId('Question', id),
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot(id)
      }),
    )
  })
})
