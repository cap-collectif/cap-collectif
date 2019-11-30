/* eslint-env jest */
const ViewerQuery = /* GraphQL */ `
  query ViewerQuery {
    viewer {
      id
      username
      email
      createdAt
      consentInternalCommunication
      avatarUrl
      websiteUrl
      facebookUrl
      twitterUrl
      linkedInUrl
      biography
      enabled
      deletedAccountAt
    }
  }
`;

describe('Public|Query.viewer', () => {
  it('fetches an admin', async () => {
    await expect(graphql(ViewerQuery, null, 'admin')).resolves.toMatchSnapshot();
  });

  it('can not access if not authenticated', async () => {
    await expect(graphql(ViewerQuery, null, 'anonymous')).rejects.toMatchSnapshot();
  });
});

describe('Internal|Query.viewer', () => {
  it('fetches admin@test.com when using internal_admin client ', async () => {
    await expect(graphql(ViewerQuery, null, 'internal_admin')).resolves.toMatchSnapshot();
  });
});
