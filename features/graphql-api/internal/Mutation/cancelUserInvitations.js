/* eslint-env jest */
import '../../_setup'

const DENIED_ERROR_MESSAGE = 'Access denied to this field'

const CancelUserInvitationsMutation = /* GraphQL */ `
  mutation CancelUserInvitationsMutation($input: CancelUserInvitationsInput!) {
    cancelUserInvitations(input: $input) {
      cancelledInvitationsIds
    }
  }
`

describe('Internal|cancelUserInvitations mutation access control', () => {
  const input = {
    invitationsEmails: ['blablapookie@pookie.com', 'danslside@pookie.com'],
  }
  it('should not throw an error when the flag is activated and the user has ROLE_ADMIN', async () => {
    expect.assertions(1)
    await expect(graphql(CancelUserInvitationsMutation, { input }, 'internal_admin')).resolves.not.toBeNull()
  })
})

describe('Internal|cancelUserInvitations mutation', () => {
  it('should cancel user invitations', async () => {
    const remInvitationId = toGlobalId('UserInvite', 'remInvitation')
    const ramInvitationId = toGlobalId('UserInvite', 'ramInvitation')

    const response = await graphql(
      CancelUserInvitationsMutation,
      {
        input: {
          invitationsEmails: ['rem@chan.com', 'ram@chan.com'],
        },
      },
      'internal_super_admin',
    )

    expect(response.cancelUserInvitations.cancelledInvitationsIds.length).toBe(2)
    expect(response.cancelUserInvitations.cancelledInvitationsIds[0]).toBe(remInvitationId)
    expect(response.cancelUserInvitations.cancelledInvitationsIds[1]).toBe(ramInvitationId)
  })
})
