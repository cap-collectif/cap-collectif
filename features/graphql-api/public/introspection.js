/* eslint-env jest */
const IntrospectionQuery = /* GraphQL */ `
  {
    __schema {
      types {
        name
      }
    }
  }
`;

describe('Public|introspection query', () => {
  it('fetche schema if enabled', async () => {
    await global.enableFeatureFlag('graphql_introspection');
    await expect(graphql(IntrospectionQuery)).resolves.toMatchSnapshot();
  });

  it('doesnt fetch schema if disabled', async () => {
    await global.disableFeatureFlag('graphql_introspection');
    await expect(graphql(IntrospectionQuery)).rejects.toThrowError('GraphQL introspection is not allowed, but the query contained __schema or __type');
    await global.enableFeatureFlag('graphql_introspection');
  });
});
