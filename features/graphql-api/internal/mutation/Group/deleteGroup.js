/* eslint-env jest */
import '../../../_setup';

const DENIED_ERROR_MESSAGE = 'Access denied to this field.';

const DeleteGroupMutation = /* GraphQL*/ `
  mutation DeleteGroupMutation($input: DeleteGroupInput!) {
    deleteGroup(input: $input) {
      deletedGroupId
    }
  }
`;

describe('mutations|deleteGroup', () => {
  it('user should not be able to delete a group.', async () => {
    const variables = {
      input: {
        groupId: 'R3JvdXA6Z3JvdXAy', // group2
      },
    };

    await expect(graphql(DeleteGroupMutation, variables, 'internal')).rejects.toThrowError(
      DENIED_ERROR_MESSAGE,
    );
  });

  it('admin should be able to delete a group.', async () => {
    const variables = {
      input: {
        groupId: 'R3JvdXA6Z3JvdXAy', // group2
      },
    };
    const deleteGroup = await graphql(DeleteGroupMutation, variables, 'internal_admin');
    expect(deleteGroup).toMatchSnapshot();
  });
});
