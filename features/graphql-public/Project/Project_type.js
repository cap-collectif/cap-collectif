/* eslint-env jest */
const ProjectTypesQuery = /* GraphQL */ `
  query ProjectTypesQuery($id: ID!) {
    project: node(id: $id) {
      id
      ... on Project {
        type {
          title
        }
      }
    }
  }
`;

describe('Preview|Project.type', () => {
  it('fetches the types of a project', async () => {
    await expect(
      graphql(ProjectTypesQuery, { id: toGlobalId('Project', 'project1') }),
    ).resolves.toMatchSnapshot();
  });
});
