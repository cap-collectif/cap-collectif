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
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
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
  /**
   * @jest-status non-compliant
   * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
   * the database helper runs only before each test.
   */
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

  /**
   * @jest-status non-compliant
   * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
   * the database helper runs only before each test.
   */
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

  /**
   * @jest-status non-compliant
   * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
   * the database helper runs only before each test.
   */
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

  /**
   * @jest-status non-compliant
   * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
   * the database helper runs only before each test.
   */
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
