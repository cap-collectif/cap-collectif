/* eslint-env jest */
import '../../../_setup';

const KickFromOrganization = /* GraphQL */ `
  mutation KickFromOrganization($input: KickFromOrganizationInput!) {
    kickFromOrganization(input: $input) {
      user {
        id
      }
      organization {
        id
        members {
          totalCount
        }
      }
      errorCode
    }
  }
`;

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
          userId: toGlobalId('User', 'user2')
        },
      },
      'internal_super_admin',
    );
    expect(response.kickFromOrganization.organization).toBeNull();
    expect(response.kickFromOrganization.user).toBeNull();
    expect(response.kickFromOrganization.errorCode).toBe("ORGANIZATION_NOT_FOUND");
  });


  it('should fail if member but neither admin nor organization admin', async () => {
    const response = await graphql(
      KickFromOrganization,
      {
        input: {
          organizationId: toGlobalId('Organization', 'organization1'),
          userId: toGlobalId('User', 'user2')
        },
      },
      'internal_user',
    );
    expect(response.kickFromOrganization.organization).toBeNull();
    expect(response.kickFromOrganization.user).toBeNull();
    expect(response.kickFromOrganization.errorCode).toBe("ORGANIZATION_NOT_FOUND");
  });

  it('should fail on unknown user', async () => {
    const organizationId = toGlobalId('Organization', 'organization1');
    const userId = toGlobalId('User', 'test');
    const response = await graphql(
      KickFromOrganization,
      {
        input: {
          organizationId,
          userId
        },
      },
      'internal_super_admin',
    );

    expect(response.kickFromOrganization.organization).toBeNull();
    expect(response.kickFromOrganization.user).toBeNull();
    expect(response.kickFromOrganization.errorCode).toBe("USER_NOT_MEMBER");
  });

  it('should fail on user not member', async () => {
    const organizationId = toGlobalId('Organization', 'organization1');
    const userId = toGlobalId('User', 'user3');
    const response = await graphql(
      KickFromOrganization,
      {
        input: {
          organizationId,
          userId
        },
      },
      'internal_super_admin',
    );

    expect(response.kickFromOrganization.organization).toBeNull();
    expect(response.kickFromOrganization.user).toBeNull();
    expect(response.kickFromOrganization.errorCode).toBe("USER_NOT_MEMBER");
  });

  it('should kick a user', async () => {
    const organizationId = toGlobalId('Organization', 'organization1');
    const userId = toGlobalId('User', 'user2');

    const checkBefore = await graphql(
      CountMembersOfOrganization,
      {
        input: organizationId
      },
      'internal_super_admin',
    );
    const expectedCount = checkBefore.organization.members.totalCount - 1;

    const response = await graphql(
      KickFromOrganization,
      {
        input: {
          organizationId,
          userId
        },
      },
      'internal_super_admin',
    );

    expect(response.kickFromOrganization.organization.id).toBe(organizationId);
    expect(response.kickFromOrganization.organization.members.totalCount).toBe(expectedCount);
    expect(response.kickFromOrganization.user.id).toBe(userId);
    expect(response.kickFromOrganization.errorCode).toBeNull();

    const checkAfter = await graphql(
      CountMembersOfOrganization,
      {
        input: organizationId
      },
      'internal_super_admin',
    );
    expect(checkAfter.organization.members.totalCount).toBe(expectedCount);
  });
});