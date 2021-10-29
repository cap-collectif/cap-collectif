/* eslint-env jest */
const UserInvitationsAvailabilitySearch = /* GraphQL */ `
  query UserInvitationsAvailabilitySearch($emails: [String!]!) {
    userInvitationsAvailabilitySearch(emails: $emails) {
      totalCount
      edges {
        node {
          email
          availableForUser
          availableForInvitation
        }
      }
    }
  }
`;

describe('Internal|UserInvitationsAvailabilitySearch', () => {
  it('should fetch the already used email addresses among the given ones', async () => {
    await expect(
      graphql(
        UserInvitationsAvailabilitySearch,
        {
          emails: ['theo@cap-collectif.com', 'rem@chan.com', 'ram@chan.com'],
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('should not fetch already used email addresses among the new ones', async () => {
    await expect(
      graphql(
        UserInvitationsAvailabilitySearch,
        {
          emails: ['newemail@mail.com', 'anothernnewemail@mail.com'],
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
