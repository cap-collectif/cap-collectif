/* eslint-env jest */

const QuestionChoiceNodeQuery = /* GraphQL */ `
  query QuestionChoiceNodeQuery($questionChoiceId: ID!) {
    questionChoice: node(id: $questionChoiceId) {
      id
      __typename
      ... on QuestionChoice {
        title
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|QuestionChoice node', () => {
  it('resolves a question choice by global ID', async () => {
    await expect(
      graphql(
        QuestionChoiceNodeQuery,
        { questionChoiceId: 'UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux' },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
