/* eslint-env jest */
const OrganizationMembers = /* GraphQL */ `
  query {
    organization: node(id: "T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjE=") {
      ... on Organization {
        title
        members {
          totalCount
          edges {
            node {
              user {
                username
              }
              role
            }
          }
        }
      }
    }
  }
`

describe('Internal|Organization.Members', () => {
  it('GraphQL admin wants to get all members of an organization', async () => {
    await expect(graphql(OrganizationMembers, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('GraphQL user not organization admin wants to get all members of an organization', async () => {
    await expect(graphql(OrganizationMembers, {}, 'internal_theo')).resolves.toMatchSnapshot()
  })

  it('GraphQL anonymous wants to get all members of an organization', async () => {
    await expect(graphql(OrganizationMembers, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
