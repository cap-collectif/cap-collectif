import '../../../_setup';

const CreateUserTypeMutation = /* GraphQL */ `
  mutation CreateUserTypesMutation($input: CreateUserTypeInput!) {
    createUserType(input: $input) {
      userType {
        id
        name
        media {
          id
        }
      }
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

const creationSnapshotPattern = {
  createUserType: {
    userType: {
      id: expect.any(String),
    },
  },
};

describe('mutations.createUserType', () => {
  let userTypeCount;
  let createdUserTypeIds = [];
  beforeAll(async () => {
    const result = await graphql(UserTypesQuery, null, 'internal_admin');
    expect(result).toMatchObject({ userTypes: expect.any(Array) });
    userTypeCount = result.userTypes.length;
  });

  it('creates a new user type', async () => {
    const result = await graphql(
      CreateUserTypeMutation,
      {
        input: {
          translations: [
            {
              name: 'ONG',
              locale: 'FR_FR',
            },
            {
              name: 'NGO',
              locale: 'EN_GB',
            },
          ],
        },
      },
      'internal_admin',
    );
    expect(result).toMatchSnapshot(creationSnapshotPattern);
    createdUserTypeIds.push(result.createUserType.userType.id);
  });

  // the user-type-nonprofit should be in the fixtures
  it('creates a new user type with a media', async () => {
    const result = await graphql(
        CreateUserTypeMutation,
        {
          input: {
            translations: [
              {
                name: 'Licorne',
                locale: 'FR_FR',
              },
            ],
            media: 'user-type-nonprofit',
          },
        },
        'internal_admin',
    );
    expect(result).toMatchSnapshot(creationSnapshotPattern);
    createdUserTypeIds.push(result.createUserType.userType.id);
  });

  it('checks user types after creation', async () => {
    const result = await graphql(UserTypesQuery, null, 'internal_admin');
    expect(result).toMatchObject({ userTypes: expect.any(Array) });
    expect(result.userTypes).toHaveLength(userTypeCount + 2);
    for (const createdId of createdUserTypeIds) {
      expect(result.userTypes.some(u => u.id === createdId)).toBe(true);
    }
  });

  it('creates a new user type with a non-existing media', async () => {
    await expect(
      graphql(
        CreateUserTypeMutation,
        {
          input: {
            translations: [
              {
                name: 'Boîte sans media',
                locale: 'FR_FR',
              },
            ],
            media: 'fake-media-id-for-user-type-test',
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('This value is not valid.');
  });

  it('tries to create a user type as a basic user', async () => {
    await expect(
        graphql(
            CreateUserTypeMutation,
            {
              input: {
                translations: [
                  {
                    name: 'G pas les droits !',
                    locale: 'FR_FR',
                  },
                ],
              },
            },
            'internal_user',
        ),
    ).rejects.toThrowError('Access denied to this field.');
  });

  it('tries to create a user type while being unauthenticated', async () => {
    await expect(
        graphql(
            CreateUserTypeMutation,
            {
              input: {
                translations: [
                  {
                    name: 'Je suis pas loggé',
                    locale: 'FR_FR',
                  },
                ],
              },
            },
            'internal',
        ),
    ).rejects.toThrowError('Access denied to this field.');
  });
});
