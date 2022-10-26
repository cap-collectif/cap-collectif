/* eslint-env jest */
import '../../../_setup';

const InviteUserToOrganization = /* GraphQL */ `
  mutation InviteUserToOrganization($input: InviteUserToOrganizationInput!) {
    inviteUserToOrganization(input: $input) {
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
`;

const input = {
  "organizationId": toGlobalId('Organization','organization1'),
  "role": "user"
}

describe('Internal|inviteUserToOrganization mutation', () => {
  it('should invite a user', async () => {
    const response = await graphql(
      InviteUserToOrganization,
      {
        input: {
          ...input,
          user: toGlobalId('User', 'userSpyl')
        },
      },
      'internal_admin',
    );

    expect(response).toMatchSnapshot();
  });
  it('should return USER_ALREADY_MEMBER errorCode', async () => {
    const response = await graphql(
      InviteUserToOrganization,
      {
        input: {
          ...input,
          user: toGlobalId('User', 'userOmar')
        },
      },
      'internal_admin',
    );
    expect(response.inviteUserToOrganization.errorCode).toBe('USER_ALREADY_MEMBER');
  });
  it('should return USER_ALREADY_INVITED errorCode', async () => {
    const response = await graphql(
      InviteUserToOrganization,
      {
        input: {
          ...input,
          user: toGlobalId('User', 'userMaxime')
        },
      },
      'internal_admin',
    );
    expect(response.inviteUserToOrganization.errorCode).toBe('USER_ALREADY_INVITED');
  });
  it('should return ORGANIZATION_NOT_FOUND errorCode', async () => {
    const response = await graphql(
      InviteUserToOrganization,
      {
        input: {
          ...input,
          organizationId: toGlobalId('Organization','notExist'),
          user: toGlobalId('User', 'userMaxime')
        },
      },
      'internal_admin',
    );
    expect(response.inviteUserToOrganization.errorCode).toBe('ORGANIZATION_NOT_FOUND');
  });
});
