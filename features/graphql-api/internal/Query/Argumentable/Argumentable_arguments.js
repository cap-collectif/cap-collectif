/* eslint-env jest */
import '../../../_setupES'

const ArgumentableArgumentsQuery = /* GraphQL */ `
  query ArgumentableArgumentsQuery($id: ID!, $includeTrashed: Boolean!, $type: ArgumentValue) {
    node(id: $id) {
      ... on Argumentable {
        arguments(first: 5, includeTrashed: $includeTrashed, type: $type) {
          totalCount
          edges {
            node {
              id
              type
              published
            }
          }
        }
      }
    }
  }
`

describe('Internal|Argumentable.arguments', () => {
  it('fetches arguments for an opinion', async () => {
    await expect(
      graphql(
        ArgumentableArgumentsQuery,
        {
          id: toGlobalId('Opinion', 'opinion2'),
          includeTrashed: false,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('includes trashed arguments when requested', async () => {
    await expect(
      graphql(
        ArgumentableArgumentsQuery,
        {
          id: toGlobalId('Opinion', 'opinion2'),
          includeTrashed: true,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches arguments for an opinion version', async () => {
    await expect(
      graphql(
        ArgumentableArgumentsQuery,
        {
          id: toGlobalId('Version', 'version1'),
          includeTrashed: false,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('filters arguments by type', async () => {
    await expect(
      graphql(
        ArgumentableArgumentsQuery,
        {
          id: toGlobalId('Opinion', 'opinion3'),
          includeTrashed: false,
          type: 'AGAINST',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
    await expect(
      graphql(
        ArgumentableArgumentsQuery,
        {
          id: toGlobalId('Opinion', 'opinion3'),
          includeTrashed: false,
          type: 'FOR',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
