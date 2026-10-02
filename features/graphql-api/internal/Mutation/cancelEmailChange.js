/* eslint-env jest */
import '../../_setupDB'

const CancelEmailChangeMutation = /* GraphQL*/ `
  mutation {
    cancelEmailChange {
      success
    }
  }
`
/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('mutations.cancelEmailChange', () => {
  it('User successfully cancel email change', async () => {
    await expect(graphql(CancelEmailChangeMutation, {}, 'internal_user')).resolves.toMatchSnapshot()
  })
})
