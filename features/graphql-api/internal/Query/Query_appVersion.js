/* eslint-env jest */
const AppVersionQuery = /* GraphQL */ `
  query AppVersionQuery {
    appVersion
  }
`;

describe('Internal|Query.appVersion', () => {
  it('returns the app version', async () => {
    await expect(graphql(AppVersionQuery, {}, 'internal')).resolves.toMatchSnapshot();
  });
});
