/* eslint-env jest */
const TIMEOUT = 15000;

const InternalQuery = /* GraphQL */ `
  query InternalQuery {
    allContributors {
      totalCount
    }
  }
`;

describe('Query.allContributors', () => {
  it(
    'fetches total number of contributors',
    async () => {
      await expect(graphql(InternalQuery, {}, 'internal')).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );
});
