/* eslint-env jest */
const UserTypes = /* GraphQL */ `
  query UserTypes  {
    userTypes {
      id
      name
    }
  }
`;

describe('Internal|Query.userTypes', () => {
  it('fetches all user types', async () => {
    await expect(graphql(UserTypes, null, 'internal_admin')).resolves.toMatchSnapshot();
  });
});
