/* eslint-env jest */
import '../../../_setup';


const DeleteMediatorMutation = /* GraphQL*/ `
  mutation DeleteMediator($input: DeleteMediatorInput!) {
    deleteMediator(input: $input) {
      deletedMediatorId
    }
  }
`

describe('mutations|deleteMediator', () => {
  beforeEach(async () => {
    await global.enableFeatureFlag('mediator');
  });
  it('admin should be able to delete a mediator.', async () => {
    const variables = {
      "input": {
        "mediatorId": "TWVkaWF0b3I6bWVkaWF0b3Ix" // mediator1
      }
    }
    const deleteMediator = await graphql(
      DeleteMediatorMutation,
      variables,
      'internal_admin',
    );
    expect(deleteMediator).toMatchSnapshot();
  });
});
