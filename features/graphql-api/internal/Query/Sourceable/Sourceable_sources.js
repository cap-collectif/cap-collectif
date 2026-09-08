/* eslint-env jest */

const SourceableSourcesQuery = /* GraphQL */ `
  query SourceableSourcesQuery($opinionId: ID!) {
    opinion: node(id: $opinionId) {
      ... on Sourceable {
        sources(first: 100) {
          totalCount
          edges {
            node {
              id
              published
            }
          }
        }
      }
    }
  }
`

describe('Internal|Sourceable.sources', () => {
  it('lists sources for an opinion', async () => {
    await expect(
      graphql(SourceableSourcesQuery, { opinionId: toGlobalId('Opinion', 'opinion3') }, 'internal_user'),
    ).resolves.toMatchSnapshot()
  })
})
