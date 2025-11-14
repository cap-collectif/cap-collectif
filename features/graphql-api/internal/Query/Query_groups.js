const GroupsQuery = /* GraphQL */ `
  query GroupsQuery($term: String, $first: Int, $after: String) {
    groups(term: $term, first: $first, after: $after) {
      totalCount
      edges {
        cursor
        node {
          title
          members {
            totalCount
          }
        }
      }
    }
  }
`

describe('Internal|Query groups', () => {
  it('fetch all groups', async () => {
    const variables = { term: '', first: null, after: null }
    await expect(graphql(GroupsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetch first two groups', async () => {
    const variables = { term: '', first: 2, after: null }
    await expect(graphql(GroupsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetch two groups following the first two groups', async () => {
    const variables = { term: '', first: 2, after: 'YXJyYXljb25uZWN0aW9uOjE=' }
    await expect(graphql(GroupsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetch groups filterd by terms', async () => {
    const variables = { term: 'Direction', first: null, after: null }
    await expect(graphql(GroupsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
