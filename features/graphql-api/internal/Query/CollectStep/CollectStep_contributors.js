//* eslint-env jest */
import '../../../_setupESOnce'

const CollectStepContributorsQuery = /* GraphQL */ `
  query CollectStepContributorsQuery($id: ID!) {
    node(id: $id) {
      ... on CollectStep {
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
describe('Preview|CollectStep.contributors connection', () => {
  it('fetches the contributors of a collect step', async () => {
    await expect(
      graphql(
        CollectStepContributorsQuery,
        {
          id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
