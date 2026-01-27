/* eslint-env jest */
import '../../../_setupDB'

const DeleteMediatorMutation = /* GraphQL*/ `
  mutation DeleteMediator($input: DeleteMediatorInput!) {
    deleteMediator(input: $input) {
      deletedMediatorId
    }
  }
`

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
