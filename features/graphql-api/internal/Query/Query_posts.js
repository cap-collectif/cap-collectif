//* eslint-env jest */
const variables = {
  id: 'VXNlcjp1c2VyMQ==',
  term: 'authors.email:(lbrunet*)',
}

const PostSearchQuery = /* GraphQL */ `
  query PostListPaginationQuery($term: String = null, $id: ID!) {
    node(id: $id) {
      __typename
      ...PostList_postOwner
      id
    }
  }

  fragment PostList_postOwner on PostOwner {
    __isPostOwner: __typename
    posts(query: $term) {
      totalCount
      edges {
        node {
          id
          title
          __typename
        }
      }
    }
    id
  }
`

describe('Internal|Query posts', () => {
  it('search post with wildcard', async () => {
    await expect(graphql(PostSearchQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('search post by title', async () => {
    await expect(
      graphql(PostSearchQuery, { id: 'VXNlcjp1c2VyMQ==', term: 'Post' }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })
})
