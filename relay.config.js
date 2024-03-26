module.exports = {
  // To Enable persisted queries:
  // persistOutput: "./queryMap.json",
  src: './frontend/js',
  noFutureProofEnums: true,
  language: 'typescript',
  schema: './schema.internal.graphql',
  artifactDirectory: './frontend/js/__generated__/~relay',
  exclude: ['**/node_modules/**', '**/__mocks__/**', '**/__generated__/**'],
  customScalars: {
    DateTime: 'string',
    Email: 'string',
    URI: 'string',
    IP: 'string',
    Address: 'string',
    JSON: 'string',
    HTML: 'string',
    Color: 'string',
    CssJSON: 'string',
    GeoJSON: 'string',
  },
}
