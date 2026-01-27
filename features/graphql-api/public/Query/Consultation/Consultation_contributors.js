//* eslint-env jest */
import '../../../_setupES'

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
