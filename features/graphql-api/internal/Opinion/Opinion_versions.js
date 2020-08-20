/* eslint-env jest */
const InternalQuery = /* GraphQL */ `
  query InternalQuery($opinionId: ID!, $count: Int!) {
    opinion: node(id: $opinionId) {
      ... on Opinion {
        versions(first: $count) {
          totalCount
          edges {
            node {
              id
              title
              published
              parent {
                id
              }
            }
          }
        }
      }
    }
  }
`;

describe('Internal Opinion_versions', () => {
  it('fetches versions of an opinion', async () => {
    const response = await graphql(
      InternalQuery,
      {
        opinionId: 'T3BpbmlvbjpvcGluaW9uNTg=',
        count: 10,
      },
      'internal',
    );
    expect(response).toMatchSnapshot();
  });

  it('fetches versions of an opinion with right count', async () => {
    const response = await graphql(
      InternalQuery,
      {
        opinionId: 'T3BpbmlvbjpvcGluaW9uNTg=',
        count: 2,
      },
      'internal',
    );
    expect(response.opinion.versions.edges.length).toBe(2);
  });

  it('fetches versions of an opinion in restricted project when autorized', async () => {
    const response = await graphql(
      InternalQuery,
      {
        opinionId: toGlobalId('Opinion', 'opinion104'),
        count: 10,
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
});
