/* eslint-disable */
// Make apollo-vscode work
const path = require('path');

const { getLanguagePlugin } = require('relay-compiler/lib/RelayCompilerMain');
const { loadConfig } = require('relay-config');

const RelayConfig = loadConfig();
const RelayLanguagePlugin = getLanguagePlugin(RelayConfig.language || 'javascript');

const ValidationRulesToExcludeForRelay = [
  'NoUndefinedVariables',
  // apollo use @connection(filter: []) vs relay @connection(filters: [])
  'KnownArgumentNames',
  // These rules are disabled in eslint plugin:
  // see: https://github.com/apollographql/eslint-plugin-graphql
  'KnownDirectives',
  'KnownFragmentNames',
  'NoUnusedFragments',
  'ProvidedNonNullArguments',
  'ProvidedRequiredArguments',
  'ScalarLeafs',
];

/**
 * @type {import("apollo-language-server/lib/config").ApolloConfigFormat}
 */
const config = {
  client: {
    service: {
      name: 'local',
      localSchemaFile: RelayConfig.schema,
    },
    validationRules: rule => !ValidationRulesToExcludeForRelay.includes(rule.name),
    includes: [
      path.join(RelayConfig.src, `**/*.{graphql,${RelayLanguagePlugin.inputExtensions.join(',')}}`),
    ],
    excludes: RelayConfig.exclude,
    tagName: 'graphql',
  },
};

module.exports = config;
