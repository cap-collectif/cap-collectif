/* eslint-env jest */
const InternalQuery = /* GraphQL */ `
  query InternalQuery {
    votes {
      totalCount
    }
  }
`;

describe('Internal|Query.votes', () => {
  it('fetches total number of votes', async () => {
    await expect(graphql(InternalQuery, {}, 'internal')).resolves.toMatchSnapshot();
  });
});
