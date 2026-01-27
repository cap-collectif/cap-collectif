/* eslint-env jest */
import '../../../_setupDB'

const DeleteUserInGroupMutation = /* GraphQL */ `
  mutation ($input: DeleteUserInGroupInput!) {
    deleteUserInGroup(input: $input) {
      group {
        id
        users {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`
describe('Internal|DeleteUserInGroup', () => {
  it('GraphQL client wants to remove a user from group', async () => {
    await expect(
      graphql(
        DeleteUserInGroupMutation,
        {
          input: {
            groupId: 'R3JvdXA6Z3JvdXAy',
            userId: 'VXNlcjp1c2VyMQ==',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
