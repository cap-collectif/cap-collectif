/* eslint-env jest */
import '../../../_setup';

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
`;

const input = {
  "organizationId": "T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjE=",
  "role": "user"
}

describe('Internal|inviteOrganizationMember mutation', () => {
  it('should invite an unregistered user', async () => {
    const response = await graphql(
      InviteOrganizationMember,
      {
        input: {
          ...input,
          email: "abc@cap-collectif.com"
        },
      },
      'internal_admin',
    );

    expect(response).toMatchSnapshot();
  });
  it('should invite an registered user', async () => {
    const response = await graphql(
      InviteOrganizationMember,
      {
        input: {
          ...input,
          email: "user10@cap-collectif.com"
        },
      },
      'internal_admin',
    );

    expect(response).toMatchSnapshot();
  });
  it('should return USER_ALREADY_MEMBER errorCode', async () => {
    const response = await graphql(
      InviteOrganizationMember,
      {
        input: {
          ...input,
          email: "sfavot@cap-collectif.com"
        },
      },
      'internal_admin',
    );
    expect(response.inviteOrganizationMember.errorCode).toBe('USER_ALREADY_MEMBER');
  });
  it('should return USER_ALREADY_INVITED errorCode', async () => {
    const response = await graphql(
      InviteOrganizationMember,
      {
        input: {
          ...input,
          email: "maxime.auriau@cap-collectif.com"
        },
      },
      'internal_admin',
    );
    expect(response.inviteOrganizationMember.errorCode).toBe('USER_ALREADY_INVITED');
  });
});
