// Make apollo-vscode work
module.exports = {
  client: {
    service: {
      name: 'local',
      localSchemaFile: './schema.internal.graphql',
    },
    includes: ['app/Resources/js/**/*.js'],
    excludes: ['**/node_modules', '**/web', '**/vendor', '**/__tests__'],
    tagName: 'graphql',
  },
};
