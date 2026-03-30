/* eslint-dev jest*/
const ProjectTabsQuery = /* GraphQL */ `
  query ProjectTabsQuery($projectId: ID!) {
    project: node(id: $projectId) {
      id
      ... on Project {
        tabs {
          __typename
          id
          title
          slug
          enabled
          type
          position
          ... on ProjectTabPresentation {
            body
          }
          ... on ProjectTabNews {
            news {
              id
              title
            }
          }
          ... on ProjectTabEvents {
            events {
              id
              title
            }
          }
          ... on ProjectTabCustom {
            body
          }
        }
      }
    }
  }
`

describe('Internal.project.tabs', () => {
  it('returns all project tabs with ordered content', async () => {
    await expect(
      graphql(
        ProjectTabsQuery,
        {
          projectId: toGlobalId('Project', 'project1'),
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
