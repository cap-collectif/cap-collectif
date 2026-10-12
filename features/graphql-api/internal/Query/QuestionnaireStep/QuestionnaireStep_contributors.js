//* eslint-env jest */

const QuestionnaireStepContributorsQuery = /* GraphQL */ `
  query QuestionnaireStepContributorsQuery($id: ID!) {
    node(id: $id) {
      ... on QuestionnaireStep {
        id
        title
        contributors(first: 5) {
          totalCount
          edges {
            node {
              id
              username
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
describe('Preview|QuestionnaireStep.contributors connection', () => {
  it('keeps the participation count without exposing identities', async () => {
    const result = await graphql(QuestionnaireStepContributorsQuery, { id: 'questionnairestep1' }, 'internal')
    expect(result.node.contributors.totalCount).toBeGreaterThan(0)
    expect(result.node.contributors.edges).toEqual([])
  })
})
