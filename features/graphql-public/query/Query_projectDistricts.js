/* eslint-env jest */
const InternalQuery = /* GraphQL */ `
  query InternalQuery {
    projectDistricts(first: 100) {
      totalCount
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

describe('Internal|Query.projectDistricts', () => {
  it('fetches all project districts', async () => {
    await expect(graphql(InternalQuery, {}, 'internal')).resolves.toMatchSnapshot();
  });
});
