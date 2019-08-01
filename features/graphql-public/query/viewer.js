/* eslint-env jest */
const TIMEOUT = 15000;

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

describe('Query.viewer', () => {
  it(
    'fetches an admin',
    async () => {
      await expect(graphql(ViewerQuery, null, 'admin')).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );

  it(
    'can not access if not authenticated',
    async () => {
      await expect(graphql(ViewerQuery, null, 'anonymous')).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );
});
