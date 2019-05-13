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

describe('ViewerQuery', () => {
  test(
    'resolves an admin',
    async () => {
      await expect(global.client.request(ViewerQuery)).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );
});
