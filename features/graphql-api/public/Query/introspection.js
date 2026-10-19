/* eslint-env jest */

const IntrospectionQuery = /* GraphQL */ `
  {
    __schema {
      types {
        name
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Relies on response snapshots for part of the API contract; add explicit assertions for those scenarios.
 */
describe('Public|introspection query', () => {
  it('fetch schema if enabled', async () => {
    await expect(graphql(IntrospectionQuery)).resolves.toMatchSnapshot()
  })

  it('doesnt fetch schema if disabled', async () => {
    await global.resetFeatureFlags({ graphql_introspection: false })

    await expect(graphql(IntrospectionQuery)).rejects.toThrowError(
      'GraphQL introspection is not allowed, but the query contained __schema or __type',
    )
  })
})
