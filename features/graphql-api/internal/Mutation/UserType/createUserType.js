import '../../../_setupDB'

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
`

const UserTypesQuery = /* GraphQL */ `
  query {
    userTypes {
      edges {
        node {
          id
          name
          media {
            url
          }
        }
      }
    }
  }
`

const creationSnapshotPattern = {
  createUserType: {
    userType: {
      id: expect.any(String),
    },
  },
}

const queryObjectPattern = {
  userTypes: {
    edges: expect.any(Array),
  },
}

describe('mutations.createUserType', () => {
  it('creates a new user type', async () => {
    const before = await graphql(UserTypesQuery, null, 'internal_admin')
    expect(before).toMatchObject(queryObjectPattern)
    const beforeCount = before.userTypes.edges.length

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
    )
    expect(result).toMatchSnapshot(creationSnapshotPattern)

    const after = await graphql(UserTypesQuery, null, 'internal_admin')
    expect(after).toMatchObject(queryObjectPattern)
    expect(after.userTypes.edges).toHaveLength(beforeCount + 1)
    expect(after.userTypes.edges.some(u => u.node.id === result.createUserType.userType.id)).toBe(true)
  })

  // the user-type-nonprofit should be in the fixtures
  it('creates a new user type with a media', async () => {
    const before = await graphql(UserTypesQuery, null, 'internal_admin')
    expect(before).toMatchObject(queryObjectPattern)
    const beforeCount = before.userTypes.edges.length

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
    )
    expect(result).toMatchSnapshot(creationSnapshotPattern)

    const after = await graphql(UserTypesQuery, null, 'internal_admin')
    expect(after).toMatchObject(queryObjectPattern)
    expect(after.userTypes.edges).toHaveLength(beforeCount + 1)
    expect(after.userTypes.edges.some(u => u.node.id === result.createUserType.userType.id)).toBe(true)
  })

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
    ).rejects.toThrowError('This value is not valid.')
  })

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
    ).rejects.toThrowError('Access denied to this field.')
  })

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
    ).rejects.toThrowError('Access denied to this field.')
  })
})
