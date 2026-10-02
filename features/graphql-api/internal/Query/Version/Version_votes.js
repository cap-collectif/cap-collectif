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

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Version.votes', () => {
  it('lists votes for a version', async () => {
    await expect(
      graphql(VersionVotesQuery, { versionId: toGlobalId('Version', 'version2') }, 'internal'),
    ).resolves.toMatchSnapshot()
  })
})
