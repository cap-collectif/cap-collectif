/* eslint-env jest */

const VersionVotesQuery = /* GraphQL */ `
  query VersionVotesQuery($versionId: ID!) {
    version: node(id: $versionId) {
      ... on Version {
        votes(first: 10) {
          totalCount
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              author {
                id
              }
              value
            }
          }
        }
      }
    }
  }
`

describe('Internal|Version.votes', () => {
  it('lists votes for a version', async () => {
    await expect(
      graphql(VersionVotesQuery, { versionId: toGlobalId('Version', 'version2') }, 'internal'),
    ).resolves.toMatchSnapshot()
  })
})
