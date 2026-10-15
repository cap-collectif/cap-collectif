//* eslint-env jest */
import '../../../_setupESOnce'

const ConsultationListContribtionsQuery = /* GraphQL */ `
  query ConsultationContributorsQuery($consultationId: ID!) {
    node(id: $consultationId) {
      ... on Consultation {
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
describe('Preview|Consultation.contributors connection', () => {
  it('fetches the contributors of a consultation', async () => {
    await expect(
      graphql(
        ConsultationListContribtionsQuery,
        {
          consultationId: 'Q29uc3VsdGF0aW9uOmRlZmF1bHQ=',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
