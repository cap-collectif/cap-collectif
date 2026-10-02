/* eslint-env jest */

const MajorityQuestionVotesQuery = /* GraphQL */ `
  query MajorityQuestionVotesQuery($id: ID!) {
    node(id: $id) {
      ... on MajorityQuestion {
        title
        totalVotesCount
        responsesByChoice {
          choice
          count
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|MajorityQuestions_votes', () => {
  it('it fetches a majority question with its votesCount and its categories', async () => {
    const id = 'UXVlc3Rpb246MTM4NQ=='
    await expect(
      graphql(
        MajorityQuestionVotesQuery,
        {
          id,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot(id)
  })
})
