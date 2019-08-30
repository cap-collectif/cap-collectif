// Make apollo-vscode work

const ValidationRulesToExcludeForRelay = ['NoUndefinedVariables'];

module.exports = {
  client: {
    service: {
      name: 'local',
      localSchemaFile: './schema.internal.graphql',
    },
    validationRules: rule => !ValidationRulesToExcludeForRelay.includes(rule.name),
    includes: ['app/Resources/js/**/*.js'],
    excludes: ['**/node_modules', '**/web', '**/vendor', '**/__tests__'],
    tagName: 'graphql',
  },
};
