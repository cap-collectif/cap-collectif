/* eslint-env jest */
import '../../_setupDB'

const CreateConsultation = /* GraphQL*/ `
  mutation CreateConsultation($input: CreateConsultationInput!) {
    createConsultation(input: $input) {
      consultation {
        title
      }
    }
  }
`

const input = {
  title: 'my new consultation',
}

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('mutations.createConsultation', () => {
  it('should create a consultation as an admin', async () => {
    const response = await graphql(
      CreateConsultation,
      {
        input,
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
})
