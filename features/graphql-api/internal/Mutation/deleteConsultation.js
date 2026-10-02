/* eslint-env jest */
import '../../_setupDB'

const DeleteConsultation = /* GraphQL*/ `
  mutation DeleteConsultation($input: DeleteConsultationInput!) {
    deleteConsultation(input: $input) {
      deletedConsultationId
    }
  }
`

const input = {
  id: toGlobalId('Consultation', '1stConsultationMultiConsultationStep'), //Q29uc3VsdGF0aW9uOjFzdENvbnN1bHRhdGlvbk11bHRpQ29uc3VsdGF0aW9uU3RlcA==
}

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('mutations.deleteConsultation', () => {
  it('should delete a consultation as an admin', async () => {
    const response = await graphql(
      DeleteConsultation,
      {
        input,
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
})
