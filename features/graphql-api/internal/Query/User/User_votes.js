/* eslint-env jest */
import '../../../_setupES'

const UserVotesQuery = /* GraphQL */ `
  query UserVotesQuery($id: ID!, $count: Int, $cursor: String, $contribuableId: ID) {
    node(id: $id) {
      ... on User {
        votes(first: $count, after: $cursor, contribuableId: $contribuableId) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              related {
                ... on Source {
                  id
                  related {
                    ... on Opinion {
                      nullable: project {
                        _id
                        visibility
                      }
                    }
                  }
                }
                ... on Proposal {
                  id
                  project {
                    _id
                    visibility
                  }
                }
                ... on Opinion {
                  id
                  nullable: project {
                    _id
                    visibility
                  }
                }
                ... on Argument {
                  id
                  related {
                    ... on Opinion {
                      id
                      nullable: project {
                        _id
                        visibility
                      }
                    }
                  }
                }
                ... on Version {
                  id
                  nullable: project {
                    _id
                    visibility
                  }
                }
                ... on Comment {
                  _id
                  commentable {
                    ... on Proposal {
                      project {
                        _id
                        visibility
                      }
                    }
                  }
                }
              }
            }
          }
          totalCount
        }
      }
    }
  }
`

const UserVotesMinQuery = /* GraphQL */ `
  query UserVotesMinQuery($id: ID!, $onlyAccounted: Boolean!) {
    node(id: $id) {
      ... on User {
        votes(first: 100, onlyAccounted: $onlyAccounted) {
          totalCount
          edges {
            node {
              id
              isAccounted
            }
          }
        }
      }
    }
  }
`

describe('User.votes connection', () => {
  it("fetches a user's votes as super admin.", async () => {
    await Promise.all(
      ['VXNlcjp1c2VyQWRtaW4'].map(async id => {
        await expect(
          graphql(
            UserVotesQuery,
            {
              id: id,
              count: 5,
            },
            'internal_super_admin',
          ),
        ).resolves.toMatchSnapshot(id)
      }),
    )
  })

  it("fetches a user's public votes as anonymous.", async () => {
    await Promise.all(
      ['VXNlcjp1c2VyQWRtaW4'].map(async id => {
        await expect(
          graphql(
            UserVotesQuery,
            {
              id: id,
              count: 5,
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot(id)
      }),
    )
  })

  it("fetches a user's public votes as admin.", async () => {
    await Promise.all(
      ['VXNlcjp1c2VyMg=='].map(async id => {
        await expect(
          graphql(
            UserVotesQuery,
            {
              id: id,
              count: 5,
              after: 'YToyOntpOjA7aToxNDg1OTA3MjU0MDAwO2k6MTtzOjQ6IjEwNTQiO30=',
            },
            'internal_admin',
          ),
        ).resolves.toMatchSnapshot(id)
      }),
    )
  })

  it('fetches a users public votes as author.', async () => {
    await Promise.all(
      ['VXNlcjp1c2VyQWRtaW4='].map(async id => {
        await expect(
          graphql(
            UserVotesQuery,
            {
              id: id,
              count: 5,
              after: 'YToyOntpOjA7aToxNDg1OTA3MjUxMDAwO2k6MTtzOjQ6IjEwNTEiO30=',
            },
            'internal_saitama',
          ),
        ).resolves.toMatchSnapshot(id)
      }),
    )
  })

  it('fetches user votes on a specific project', async () => {
    await expect(
      graphql(
        UserVotesQuery,
        {
          id: 'VXNlcjp1c2VyMg==',
          contribuableId: 'UHJvamVjdDpwcm9qZWN0Ng==',
          first: 5,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches user votes on specific step', async () => {
    await expect(
      graphql(
        UserVotesQuery,
        {
          id: 'VXNlcjp1c2VyMg==',
          contribuableId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwOA==',
          first: 5,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches user votes including some not accounted', async () => {
    await expect(
      graphql(
        UserVotesMinQuery,
        {
          id: toGlobalId('User', 'user5'),
          onlyAccounted: false,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches user votes accounted', async () => {
    await expect(
      graphql(
        UserVotesMinQuery,
        {
          id: toGlobalId('User', 'user5'),
          onlyAccounted: true,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
