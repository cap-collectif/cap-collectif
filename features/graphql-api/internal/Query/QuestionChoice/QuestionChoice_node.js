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
