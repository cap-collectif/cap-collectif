/* eslint-env jest */

const OpinionFollowersQuery = /* GraphQL */ `
  query OpinionFollowersQuery($opinionId: ID!, $count: Int, $cursor: String) {
    opinion: node(id: $opinionId) {
      ... on Opinion {
        followers(first: $count, after: $cursor, orderBy: { field: NAME, direction: ASC }) {
          edges {
            cursor
            node {
              _id
            }
          }
          totalCount
        }
      }
    }
  }
`

const PaginatedOpinionFollowersQuery = /* GraphQL */ `
  query PaginatedOpinionFollowersQuery($opinionId: ID!, $count: Int, $cursor: String) {
    opinion: node(id: $opinionId) {
      id
      ... on Opinion {
        followers(first: $count, after: $cursor) {
          edges {
            cursor
            node {
              id
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
        }
      }
    }
  }
`

describe('Internal|Opinion.followers connection', () => {
  it('lists followers ordered by name', async () => {
    await expect(
      graphql(
        OpinionFollowersQuery,
        {
          opinionId: 'T3BpbmlvbjpvcGluaW9uNg==',
          count: 2,
          cursor: null,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('paginates followers from a cursor', async () => {
    await expect(
      graphql(
        PaginatedOpinionFollowersQuery,
        {
          opinionId: 'T3BpbmlvbjpvcGluaW9uNg==',
          count: 20,
          cursor: 'YXJyYXljb25uZWN0aW9uOjMa',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('denies followers access in a non-followable project', async () => {
    await expect(
      graphql(
        PaginatedOpinionFollowersQuery,
        {
          opinionId: 'T3BpbmlvbjpvcGluaW9uNTc=',
          count: 20,
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })
})
