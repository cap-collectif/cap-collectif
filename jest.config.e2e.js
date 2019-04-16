module.exports = {
    roots: ['features/graphql-public'],
    testEnvironment: 'node',
    testRegex: '\\.js$',
    transform: {
      '.*': 'babel-jest',
    },
  };
  