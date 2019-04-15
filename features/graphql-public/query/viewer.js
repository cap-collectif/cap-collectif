/* eslint-env jest */
const TIMEOUT = 15000;

const ViewerQuery = /* GraphQL */ `
  query ViewerQuery {
    viewer {
      id
      username
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
