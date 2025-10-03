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
  it('fetch schema if enabled', async () => {
    await global.enableFeatureFlag('graphql_introspection');
    await global.enableFeatureFlag('public_api');
    await expect(graphql(IntrospectionQuery)).resolves.toMatchSnapshot();
  });

  it('doesnt fetch schema if disabled', async () => {
    await global.disableFeatureFlag('graphql_introspection');
    await expect(graphql(IntrospectionQuery)).rejects.toThrowError(
      'GraphQL introspection is not allowed, but the query contained __schema or __type',
    );
    await global.enableFeatureFlag('graphql_introspection');
    await global.disableFeatureFlag('public_api');
  });
});
