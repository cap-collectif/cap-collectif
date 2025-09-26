import '../../../_setup';

const UpdateUserTypeMutation = /* GraphQL */ `
  mutation UpdateUserTypesMutation($input: UpdateUserTypeInput!) {
    updateUserType(input: $input) {
      userType {
        id
        name
        translations {
          locale
          name
        }
        media {
          url
        }
      }
    }
  }
`;

describe('mutations.updateUserType', () => {
  const userTypeGlobalId = 'VXNlclR5cGU6NA=='; // UserType:4
  // the media:user-type-nonprofit and id:4 should be in the fixtures
  it('updates a user type', async () => {
    await expect(
      graphql(
        UpdateUserTypeMutation,
        {
          input: {
            id: userTypeGlobalId,
            translations: [
              {
                name: 'Institution avec media',
                locale: 'FR_FR',
              },
            ],
            media: 'user-type-nonprofit',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  // the id:4 should be in the fixtures
  it('tries to update a user type with a non-existing media', async () => {
    await expect(
      graphql(
        UpdateUserTypeMutation,
        {
          input: {
            id: userTypeGlobalId,
            translations: [
              {
                name: 'Institution avec media',
                locale: 'FR_FR',
              },
            ],
            media: 'this-media-does-not-exist',
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('This value is not valid.');
  });

  // the id:4 should be in the fixtures
  it('tries to update a user type with a basic user', async () => {
    await expect(
      graphql(
        UpdateUserTypeMutation,
        {
          input: {
            id: userTypeGlobalId,
            translations: [
              {
                name: 'Institution avec media',
                locale: 'FR_FR',
              },
            ],
          },
        },
        'internal_user',
      ),
    ).rejects.toThrowError('Access denied to this field.');
  });

  // the id:4 should be in the fixtures
  it('tries to update a user type without being authenticated', async () => {
    await expect(
      graphql(
        UpdateUserTypeMutation,
        {
          input: {
            id: userTypeGlobalId,
            translations: [
              {
                name: 'Institution avec media',
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
