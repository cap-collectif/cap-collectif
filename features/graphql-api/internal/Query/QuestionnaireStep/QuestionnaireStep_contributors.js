//* eslint-env jest */
import '../../../_setupES'

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
  it('fetches the contributors of a questionnaire step', async () => {
    await expect(
      graphql(
        QuestionnaireStepContributorsQuery,
        {
          id: 'questionnairestep1',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
