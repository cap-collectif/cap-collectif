/* eslint-env jest */
import '../../../_setupESOnce'

const SourceVotesQuery = /* GraphQL */ `
  query SourceVotesQuery($sourceId: ID!) {
    source: node(id: $sourceId) {
      id
      ... on Source {
        votes {
          totalCount
          edges {
            node {
              id
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
describe('Internal|Source.votes', () => {
  it('lists votes for a source', async () => {
    await expect(
      graphql(SourceVotesQuery, { sourceId: toGlobalId('Source', 'source43') }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })
})
