import '../../../_setup';

const DeleteUserTypeMutation = /* GraphQL */ `
  mutation DeleteUserTypeMutation($input: DeleteUserTypeInput!) {
    deleteUserType(input: $input) {
      deletedUserTypeId
    }
  }
`;
const UserTypesQuery = /* GraphQL */ `
  query {
    userTypes {
      id,
      name,
      media {
        id
      }
    }
  }
`;

// this id should be in the fixtures
const input = {
  input: {
    id: 1,
  },
};

describe('mutations.deleteUserType', () => {
  let userTypeCount;
  beforeAll(async () => {
    const result = await graphql(UserTypesQuery, null, 'internal_admin');
    expect(result).toMatchObject({ userTypes: expect.any(Array) });
    expect(result.userTypes.some(u => u.id === '1')).toBe(true);
    userTypeCount = result.userTypes.length;
  });

  it('deletes an existing user type', async () => {
    await expect(
      graphql(DeleteUserTypeMutation, input, 'internal_admin'),
    ).resolves.toMatchSnapshot();
  });

  it('checks user types after deletion', async () => {
    const result = await graphql(UserTypesQuery, null, 'internal_admin');
    expect(result).toMatchObject({ userTypes: expect.any(Array) });
    expect(result.userTypes).toHaveLength(userTypeCount - 1);
    expect(result.userTypes.some(u => u.id === '1')).toBe(false);
  });

  // a delete on a non-existing resource must respond as if the resource was sucessfully deleted
  it('deletes a non-existing user type', async () => {
    await expect(
      graphql(DeleteUserTypeMutation, input, 'internal_admin'),
    ).rejects.toThrowError('Unknown userType with id "1"');
  });

  it('counts user types after deletion of a non-existing user type', async () => {
    const result = await graphql(UserTypesQuery, null, 'internal_admin');
    expect(result).toMatchObject({ userTypes: expect.any(Array) });
    expect(result.userTypes).toHaveLength(userTypeCount - 1);
  });

  it('tries to delete a user type as a basic user', async () => {
    await expect(graphql(DeleteUserTypeMutation, input, 'internal_user')).rejects.toThrowError(
      'Access denied to this field.',
    );
  });

  it('tries to delete a user type wihtout being authenticated', async () => {
    await expect(graphql(DeleteUserTypeMutation, input, 'internal')).rejects.toThrowError(
      'Access denied to this field.',
    );
  });
});
