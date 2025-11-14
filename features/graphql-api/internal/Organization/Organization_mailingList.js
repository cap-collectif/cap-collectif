/* eslint-env jest */
const OrganizationMailingList = /* GraphQL */ `
  query OrganizationMailingList($organizationId: ID!) {
    node(id: $organizationId) {
      ... on Organization {
        id
        mailingLists {
          edges {
            node {
              id
              users {
                edges {
                  node {
                    username
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

describe('Internal|Organization.MailingList', () => {
  it('organization admin should be able to fetch all mailingList from organization', async () => {
    await expect(
      graphql(
        OrganizationMailingList,
        {
          organizationId: toGlobalId('Organization', 'organization2'),
        },
        'internal_valerie',
      ),
    ).resolves.toMatchSnapshot()
  })
})
