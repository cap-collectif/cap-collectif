import '../../../_setupDB'

const DeleteUserTypeMutation = /* GraphQL */ `
  mutation DeleteUserTypeMutation($input: DeleteUserTypeInput!) {
    deleteUserType(input: $input) {
      deletedUserTypeId
    }
  }
`
const UserTypesQuery = /* GraphQL */ `
  query {
    userTypes {
      totalCount
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

// this id should be in the fixtures
const userTypeGlobalID = 'VXNlclR5cGU6MQ==' // UserType:1

const input = {
  input: {
    id: userTypeGlobalID,
  },
}

const queryObjectPattern = {
  userTypes: {
    edges: expect.any(Array),
  },
}

describe('mutations.deleteUserType', () => {
  it('deletes an existing user type', async () => {
    // save the number of user types before the deletion
    const before = await graphql(UserTypesQuery, null, 'internal_admin')
    const beforeCount = before.userTypes.totalCount

    // checks that the user type to delete is in the list of user types
    expect(before.userTypes.edges.some(u => u.node.id === userTypeGlobalID)).toBe(true)

    await expect(graphql(DeleteUserTypeMutation, input, 'internal_admin')).resolves.toMatchSnapshot()

    // checks the number of user types after the deletion
    const after = await graphql(UserTypesQuery, null, 'internal_admin')
    expect(after.userTypes.totalCount).toBe(beforeCount - 1)

    // checks that the user type to delete is not in the list of user types anymore
    expect(after.userTypes.edges.some(u => u.node.id === userTypeGlobalID)).toBe(false)
  })

  it('deletes a non-existing user type', async () => {
    await expect(
      graphql(
        DeleteUserTypeMutation,
        {
          input: {
            id: 'dW5rbm93biB1c2Vy', // unknown user
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('Unknown userType with globalID: dW5rbm93biB1c2Vy')
  })

  it('tries to delete a user type as a basic user', async () => {
    await expect(graphql(DeleteUserTypeMutation, input, 'internal_user')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })

  it('tries to delete a user type wihtout being authenticated', async () => {
    await expect(graphql(DeleteUserTypeMutation, input, 'internal')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
})
