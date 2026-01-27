/* eslint-env jest */
import '../../_setupDB'

const CancelEmailChangeMutation = /* GraphQL*/ `
  mutation {
    cancelEmailChange {
      success
    }
  }
`
describe('mutations.cancelEmailChange', () => {
  it('User successfully cancel email change', async () => {
    await expect(graphql(CancelEmailChangeMutation, {}, 'internal_user')).resolves.toMatchSnapshot()
  })
})
