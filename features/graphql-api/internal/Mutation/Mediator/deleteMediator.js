/* eslint-env jest */
import '../../../_setupDB'

const DeleteMediatorMutation = /* GraphQL*/ `
  mutation DeleteMediator($input: DeleteMediatorInput!) {
    deleteMediator(input: $input) {
      deletedMediatorId
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('mutations|deleteMediator', () => {
  it('admin should be able to delete a mediator.', async () => {
    const variables = {
      input: {
        mediatorId: 'TWVkaWF0b3I6bWVkaWF0b3Ix', // mediator1
      },
    }
    const deleteMediator = await graphql(DeleteMediatorMutation, variables, 'internal_admin')
    expect(deleteMediator).toMatchSnapshot()
  })
})
