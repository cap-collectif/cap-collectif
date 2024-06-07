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
    await expect(graphql(IntrospectionQuery)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"GraphQL introspection is not allowed, but the query contained __schema or __type: {\\"response\\":{\\"errors\\":[{\\"message\\":\\"GraphQL introspection is not allowed, but the query contained __schema or __type\\",\\"extensions\\":{\\"category\\":\\"graphql\\"},\\"locations\\":[{\\"line\\":3,\\"column\\":5}]}],\\"status\\":200},\\"request\\":{\\"query\\":\\"\\\\n  {\\\\n    __schema {\\\\n      types {\\\\n        name\\\\n      }\\\\n    }\\\\n  }\\\\n\\"}}"`,
    );
    await global.enableFeatureFlag('graphql_introspection');
  });
});
