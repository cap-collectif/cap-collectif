//* eslint-env jest */
const ProjectsArchivedFilterQuery = /* GraphQL */ `
    query ProjectsArchivedFilterQuery(
        $count: Int
        $cursor: String
        $archived: ProjectArchiveFilter) {
        projects(first: $count, after: $cursor, archived: $archived) {
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

const archivedFiltersVariables = {
  "count": 16,
  "cursor": null,
  "archived": null
}

describe('Internal|Query projects', () => {

  it('fetches all projects', async () => {
    await expect(graphql(ProjectsArchivedFilterQuery, archivedFiltersVariables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches archived projects', async () => {
    await expect(graphql(ProjectsArchivedFilterQuery, {
      ...archivedFiltersVariables,
      archived: "ARCHIVED"
    }, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches non archived projects', async () => {
    await expect(graphql(ProjectsArchivedFilterQuery, {
      ...archivedFiltersVariables,
      archived: "ACTIVE"
    }, 'internal_admin')).resolves.toMatchSnapshot();
  });

});
