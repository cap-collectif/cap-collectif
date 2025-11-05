/* eslint-env jest */
import '../../../_setup'

const UpdateGroupMutation = /* GraphQL*/ `
  mutation ($input: UpdateGroupInput!) {
      updateGroup(input: $input) {
        group {
          id
          title
          description
        }
      }
    }
`

describe('mutations|updateGroup', () => {
  it('GraphQL client wants to update a group', async () => {
    const variables = {
      input: {
        groupId: 'R3JvdXA6Z3JvdXAy',
        title: 'Nouveau titre',
        description: 'Nouvelle description',
      },
    }

    await expect(graphql(UpdateGroupMutation, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
