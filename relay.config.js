module.exports = {
  src: 'app/Resources/js',
  noFutureProofEnums: true,
  language: 'js-flow-uncommented',
  schema: 'schema.internal.graphql',
  artifactDirectory: 'app/Resources/js/__generated__/~relay',
  customScalars: {
    DateTime: 'String',
    Email: 'String',
    URI: 'String',
    IP: 'String',
    Address: 'String',
    JSON: 'String',
    HTML: 'String',
    Color: 'String',
    CssJSON: 'String',
    GeoJSON: 'String',
  },
};
