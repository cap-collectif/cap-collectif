//* eslint-env jest */
const ProjectQuery = /* GraphQL */ `
    query ProjectQuery(
        $count: Int
        $cursor: String
        $archived: ProjectArchiveFilter
        $status: ID
      ) {
        projects(first: $count, after: $cursor, archived: $archived, status: $status) {
            totalCount
            edges {
                node {
                    id
                    title
                    archived
                    __typename
                }
                cursor
            }
        }
    }
`;

const variables = {
  "count": 16,
  "cursor": null,
  "archived": null,
  "status": null
}

describe('Internal|Query projects', () => {

  it('fetches all projects', async () => {
    await expect(graphql(ProjectQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches archived projects', async () => {
    await expect(graphql(ProjectQuery, {
      ...variables,
      archived: "ARCHIVED"
    }, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches non archived projects', async () => {
    await expect(graphql(ProjectQuery, {
      ...variables,
      archived: "ACTIVE"
    }, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches closed projects', async () => {
    await expect(graphql(ProjectQuery, {
      ...variables,
      status: 2,
    }, 'internal_admin')).resolves.toMatchSnapshot();
  });

});
