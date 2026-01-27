/* eslint-env jest */
import '../../../_setupDB'

const KickFromOrganization = /* GraphQL */ `
  mutation KickFromOrganization($input: KickFromOrganizationInput!) {
    kickFromOrganization(input: $input) {
      deletedMemberShipId
      errorCode
    }
  }
`

const CountMembersOfOrganization = /* GraphQL */ `
  query CountMembersOfOrganization($input: ID!) {
    organization: node(id: $input) {
      ... on Organization {
        members {
          totalCount
        }
      }
    }
  }
`

describe('Internal|kickFromOrganization mutation', () => {
  it('should fail on unknown organization', async () => {
    const response = await graphql(
      KickFromOrganization,
      {
        input: {
          organizationId: toGlobalId('Organization', 'test'),
          userId: toGlobalId('User', 'userOmar'),
        },
      },
      'internal_super_admin',
    )
    expect(response.kickFromOrganization.deletedMemberShipId).toBeNull()
    expect(response.kickFromOrganization.errorCode).toBe('ORGANIZATION_NOT_FOUND')
  })

  it('should fail if member but neither admin nor organization admin', async () => {
    const response = await graphql(
      KickFromOrganization,
      {
        input: {
          organizationId: toGlobalId('Organization', 'organization1'),
          userId: toGlobalId('User', 'userOmar'),
        },
      },
      'internal_user',
    )
    expect(response.kickFromOrganization.deletedMemberShipId).toBeNull()
    expect(response.kickFromOrganization.errorCode).toBe('ORGANIZATION_NOT_FOUND')
  })

  it('should fail on unknown user', async () => {
    const organizationId = toGlobalId('Organization', 'organization1')
    const userId = toGlobalId('User', 'test')
    const response = await graphql(
      KickFromOrganization,
      {
        input: {
          organizationId,
          userId,
        },
      },
      'internal_super_admin',
    )

    expect(response.kickFromOrganization.deletedMemberShipId).toBeNull()
    expect(response.kickFromOrganization.errorCode).toBe('USER_NOT_MEMBER')
  })

  it('should fail on user not member', async () => {
    const organizationId = toGlobalId('Organization', 'organization1')
    const userId = toGlobalId('User', 'user3')
    const response = await graphql(
      KickFromOrganization,
      {
        input: {
          organizationId,
          userId,
        },
      },
      'internal_super_admin',
    )

    expect(response.kickFromOrganization.deletedMemberShipId).toBeNull()
    expect(response.kickFromOrganization.errorCode).toBe('USER_NOT_MEMBER')
  })

  it('should kick a user as admin of organization', async () => {
    const organizationId = toGlobalId('Organization', 'organization1')
    const userId = toGlobalId('User', 'userOmar')

    const checkBefore = await graphql(
      CountMembersOfOrganization,
      {
        input: organizationId,
      },
      'internal_mickael',
    )
    const expectedCount = checkBefore.organization.members.totalCount - 1

    const response = await graphql(
      KickFromOrganization,
      {
        input: {
          organizationId,
          userId,
        },
      },
      'internal_super_admin',
    )

    expect(response.kickFromOrganization.deletedMemberShipId).not.toBe(null)
    expect(response.kickFromOrganization.errorCode).toBeNull()

    const checkAfter = await graphql(
      CountMembersOfOrganization,
      {
        input: organizationId,
      },
      'internal_super_admin',
    )
    expect(checkAfter.organization.members.totalCount).toBe(expectedCount)
  })

  it('should kick a user as super admin', async () => {
    const organizationId = toGlobalId('Organization', 'organization1')
    const userId = toGlobalId('User', 'userMickael')

    const checkBefore = await graphql(
      CountMembersOfOrganization,
      {
        input: organizationId,
      },
      'internal_super_admin',
    )
    const expectedCount = checkBefore.organization.members.totalCount - 1

    const response = await graphql(
      KickFromOrganization,
      {
        input: {
          organizationId,
          userId,
        },
      },
      'internal_super_admin',
    )

    expect(response.kickFromOrganization.deletedMemberShipId).not.toBe(null)
    expect(response.kickFromOrganization.errorCode).toBeNull()

    const checkAfter = await graphql(
      CountMembersOfOrganization,
      {
        input: organizationId,
      },
      'internal_super_admin',
    )
    expect(checkAfter.organization.members.totalCount).toBe(expectedCount)
  })
})
