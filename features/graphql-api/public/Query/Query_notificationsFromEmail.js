/* eslint-env jest */
const Query = /* GraphQL */ `
  query NotificationsFromQuery {
    notificationsFromEmail
  }
`;

describe('Query.notificationsFromEmail', () => {
  it('returns the from email.', async () => {
    await expect(graphql(Query, {}, 'internal')).resolves.toMatchSnapshot();
  });
});
