/* eslint-env jest */
import '../../../_setupDB'

const InviteOrganizationMember = /* GraphQL */ `
  mutation InviteOrganizationMember($input: InviteOrganizationMemberInput!) {
    inviteOrganizationMember(input: $input) {
      invitation {
        email
        user {
          email
        }
        role
      }
      errorCode
    }
  }
`

const input = {
  organizationId: toGlobalId('Organization', 'organization1'),
  role: 'USER',
}

describe('Internal|inviteOrganizationMember mutation', () => {
  it('should invite an unregistered user', async () => {
    const response = await graphql(
      InviteOrganizationMember,
      {
        input: {
          ...input,
          email: 'abc@cap-collectif.com',
        },
      },
      'internal_admin',
    )

    expect(response).toMatchSnapshot()
  })
  it('should return USER_NOT_ONLY_ROLE_USER errorCode', async () => {
    const response = await graphql(
      InviteOrganizationMember,
      {
        input: {
          ...input,
          email: 'sfavot@cap-collectif.com',
        },
      },
      'internal_admin',
    )
    expect(response.inviteOrganizationMember.errorCode).toBe('USER_NOT_ONLY_ROLE_USER')
  })

  it('should return USER_ALREADY_INVITED errorCode', async () => {
    const response = await graphql(
      InviteOrganizationMember,
      {
        input: {
          ...input,
          organizationId: toGlobalId('Organization', 'organization2'),
          email: 'toto@cap-collectif.com',
        },
      },
      'internal_admin',
    )
    expect(response.inviteOrganizationMember.errorCode).toBe('USER_ALREADY_INVITED')
  })

  it('should return USER_ALREADY_MEMBER_OF_ANOTHER_ORGANIZATION errorCode', async () => {
    const response = await graphql(
      InviteOrganizationMember,
      {
        input: {
          ...input,
          organizationId: toGlobalId('Organization', 'organization2'),
          email: 'omar@cap-collectif.com',
        },
      },
      'internal_admin',
    )
    expect(response.inviteOrganizationMember.errorCode).toBe('USER_ALREADY_MEMBER_OF_ANOTHER_ORGANIZATION')
  })

  it('should return ORGANIZATION_NOT_FOUND errorCode', async () => {
    const response = await graphql(
      InviteOrganizationMember,
      {
        input: {
          ...input,
          organizationId: toGlobalId('Organization', 'notExist'),
          email: 'toto@cap-collectif.com',
        },
      },
      'internal_admin',
    )
    expect(response.inviteOrganizationMember.errorCode).toBe('ORGANIZATION_NOT_FOUND')
  })
})
