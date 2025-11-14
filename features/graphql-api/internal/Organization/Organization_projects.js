/* eslint-env jest */
const OrganizationProjectsQuery = /* GraphQL */ `
  query OrganizationProjects($organizationId: ID!, $query: String) {
    node(id: $organizationId) {
      ... on Organization {
        id
        projects(query: $query) {
          totalCount
          edges {
            node {
              title
              visibility
            }
          }
        }
      }
    }
  }
`

describe('Internal|Organization.Projects', () => {
  it('anonymous should be able to fetch public projects from organization', async () => {
    await expect(
      graphql(
        OrganizationProjectsQuery,
        {
          organizationId: 'T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjI=', // Organization:organization2
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('orga member should be able to fetch projects from organization', async () => {
    await expect(
      graphql(
        OrganizationProjectsQuery,
        {
          organizationId: 'T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjI=', // Organization:organization2
        },
        'internal_valerie',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('admin should be able to fetch projects from organization', async () => {
    await expect(
      graphql(
        OrganizationProjectsQuery,
        {
          organizationId: 'T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjI=', // Organization:organization2
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('super admin should be able to fetch projects from organization', async () => {
    await expect(
      graphql(
        OrganizationProjectsQuery,
        {
          organizationId: 'T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjI=', // Organization:organization2
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('orga member should be able to filter projects by title', async () => {
    await expect(
      graphql(
        OrganizationProjectsQuery,
        {
          organizationId: 'T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjI=', // Organization:organization2
          query: 'Budget',
        },
        'internal_valerie',
      ),
    ).resolves.toMatchSnapshot()
  })
})
