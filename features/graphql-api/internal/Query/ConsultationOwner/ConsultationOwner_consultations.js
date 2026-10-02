/* eslint-env jest */
const ConsultationOwnerConsultationQuery = /* GraphQL */ `
  query ConsultationOwnerConsultationQuery {
    viewer {
      consultations {
        totalCount
        edges {
          node {
            title
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
describe('Internal.consultationOwner.consultations', () => {
  it('should fetch all consultations as an admin', async () => {
    await expect(graphql(ConsultationOwnerConsultationQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
