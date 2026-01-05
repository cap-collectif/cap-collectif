/* eslint-env jest */

const ViewerMailingListsQuery = /* GraphQL */ `
  query ViewerMailingListQuery($affiliations: [MailingListAffiliation!], $term: String) {
    viewer {
      mailingLists(affiliations: $affiliations, term: $term) {
        totalCount
        edges {
          node {
            id
            name
            isDeletable
            creator {
              id
              username
            }
            project {
              id
              title
            }
            users {
              totalCount
            }
          }
        }
      }
    }
  }
`

describe('Internal.viewer.mailingLists', () => {
  it('should get a project owners own mailingLists', async () => {
    await expect(
      graphql(ViewerMailingListsQuery, { affiliations: ['OWNER'] }, 'internal_theo'),
    ).resolves.toMatchSnapshot()
  })

  it('should thrown an error if a non-admin tries to get all mailingLists', async () => {
    await expect(graphql(ViewerMailingListsQuery, { affiliations: [] }, 'internal_theo')).rejects.toThrowError(
      'cannot request without affiliation',
    )
  })

  it('should get an admin own mailingLists', async () => {
    await expect(
      graphql(ViewerMailingListsQuery, { affiliations: ['OWNER'] }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })

  it('should get all mailingLists as admin', async () => {
    await expect(graphql(ViewerMailingListsQuery, { affiliations: [] }, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('should search mailingLists', async () => {
    await expect(graphql(ViewerMailingListsQuery, { term: 'COVID' }, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('should search mailingLists that dont exist', async () => {
    await expect(graphql(ViewerMailingListsQuery, { term: 'COVID20' }, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
