/* eslint-env jest */
import '../../_setupES'

const ArgumentsQuery = /* GraphQL */ `
  query arguments($term: String, $first: Int, $after: String, $orderBy: ArgumentOrder) {
    arguments(term: $term, first: $first, after: $after, orderBy: $orderBy) {
      totalCount
      edges {
        node {
          __typename
          body
          related {
            id
            url
          }
          author {
            username
          }
          trashedStatus
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`

describe('Internal|Query.arguments', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('fetches list of arguments', async () => {
    await expect(graphql(ArgumentsQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('fetches list of arguments based on author name', async () => {
    await expect(graphql(ArgumentsQuery, { term: 'lbrunet' }, 'internal_admin')).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('fetches list of arguments based on body', async () => {
    await expect(graphql(ArgumentsQuery, { term: 'blabla' }, 'internal_admin')).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an explicit result or refusal from the real GraphQL read contract using stable
   * fixture data.
   */
  it('should throw access denied', async () => {
    await expect(graphql(ArgumentsQuery, {}, 'internal_user')).rejects.toThrowError('Access denied to this field.')
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks page lengths without asserting the returned identities or cursor progression.
   */
  it('fetches the first page of items', async () => {
    const res = await graphql(ArgumentsQuery, { first: 10, after: null }, 'internal_admin')
    expect(res.arguments.edges).toHaveLength(10)
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks page lengths without asserting the returned identities or cursor progression.
   */
  it('fetches the next 10 items after the first page', async () => {
    let res = await graphql(ArgumentsQuery, { first: 10, after: null }, 'internal_admin')

    const endCursor = res.arguments.pageInfo.endCursor

    res = await graphql(ArgumentsQuery, { first: 10, after: endCursor }, 'internal_admin')
    expect(res.arguments.edges).toHaveLength(10)
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('fetches the arguments list ordered by latest created', async () => {
    await expect(
      graphql(
        ArgumentsQuery,
        {
          orderBy: { field: 'CREATED_AT', direction: 'DESC' },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('fetches the arguments list ordered by latest updated', async () => {
    await expect(
      graphql(
        ArgumentsQuery,
        {
          orderBy: { field: 'UPDATED_AT', direction: 'DESC' },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('fetches the arguments list ordered by first created', async () => {
    await expect(
      graphql(
        ArgumentsQuery,
        {
          orderBy: { field: 'CREATED_AT', direction: 'ASC' },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('fetches the arguments list ordered by first updated', async () => {
    await expect(
      graphql(
        ArgumentsQuery,
        {
          orderBy: { field: 'UPDATED_AT', direction: 'ASC' },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an explicit result or refusal from the real GraphQL read contract using stable
   * fixture data.
   */
  it('fetches an empty page when offset exceeds total items', async () => {
    let res = await graphql(
      ArgumentsQuery,
      { first: 1, after: 'YXJyYXljb25uZWN0aW9uOjI3MQ==' /* arrayconnection:271 */ },
      'internal_admin',
    )
    expect(res.arguments.edges).toHaveLength(0)
  })
})
