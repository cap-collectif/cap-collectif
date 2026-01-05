/* eslint-env jest */
import '../../../../_setup'

const createGroupMutation = /* GraphQL */ `
  mutation ($input: CreateGroupInput!) {
    createGroup(input: $input) {
      group {
        id
        title
      }
      importedUsers {
        email
      }
      notFoundEmails
      alreadyImportedUsers {
        email
      }
    }
  }
`

describe('Internal|Group', () => {
  it('GraphQL client wants to create a group', async () => {
    await expect(
      graphql(
        createGroupMutation,
        {
          input: {
            title: 'Nouveau groupe',
            emails: ['lbrunet@cap-collectif.com', 'unexistentEmail@cap-collectif.com'],
            dryRun: true,
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
