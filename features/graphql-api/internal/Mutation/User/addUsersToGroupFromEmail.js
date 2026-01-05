import '../../../_setup'

const AddUsersToGroupFromEmailMutation = /* GraphQL */ `
  mutation AddUsersToGroupFromEmail($input: AddUsersToGroupFromEmailInput!) {
    addUsersToGroupFromEmail(input: $input) {
      importedUsers {
        _id
        email
      }
      notFoundEmails
      alreadyImportedUsers {
        id
      }
    }
  }
`

const CountUsersToGroupFromEmailMutation = /* GraphQL */ `
  query node($groupId: ID!) {
    group: node(id: $groupId) {
      ... on Group {
        users(first: 3) {
          totalCount
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

const input = {
  emails: [
    'lbrunet@cap-collectif.com',
    'sfavot@cap-collectif.com',
    'pierre@cap-collectif.com',
    'unknown@unknown.com',
    'unknown@unknown.com',
  ],
  dryRun: true,
  groupId: 'R3JvdXA6Z3JvdXA1',
}

const countInput = {
  groupId: 'R3JvdXA6Z3JvdXA1',
}

const inputDryRunFalse = {
  emails: ['lbrunet@cap-collectif.com', 'sfavot@cap-collectif.com', 'pierre@cap-collectif.com', 'unknown@unknown.com'],
  dryRun: false,
  groupId: 'R3JvdXA6Z3JvdXA1',
}

describe('mutations.addUsersToGroupFromEmailInput', () => {
  it('wants to add a list of emails to a group with some wrong email with dry run as admin', async () => {
    const mutationResponse = await graphql(AddUsersToGroupFromEmailMutation, { input: input }, 'internal_admin')
    expect(mutationResponse).toMatchSnapshot()

    const queryResponse = await graphql(CountUsersToGroupFromEmailMutation, countInput, 'internal_admin')
    expect(queryResponse).toMatchSnapshot()
  })
  it('wants to add a list of emails to a group with some wrong email without dry run as admin', async () => {
    const mutationWithoutDryRunResponse = await graphql(
      AddUsersToGroupFromEmailMutation,
      { input: inputDryRunFalse },
      'internal_admin',
    )
    expect(mutationWithoutDryRunResponse).toMatchSnapshot()

    const queryWithoutDryRunResponse = await graphql(CountUsersToGroupFromEmailMutation, countInput, 'internal_admin')
    expect(queryWithoutDryRunResponse).toMatchSnapshot()
  })
})
