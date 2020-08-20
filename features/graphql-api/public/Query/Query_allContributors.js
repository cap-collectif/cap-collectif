/* eslint-env jest */
const InternalQuery = /* GraphQL */ `
  query InternalQuery {
    allContributors {
      totalCount
    }
  }
`;

describe('Internal|Query.allContributors', () => {
  it('fetches total number of contributors', async () => {
    await expect(graphql(InternalQuery, {}, 'internal')).resolves.toMatchSnapshot();
  });
});
