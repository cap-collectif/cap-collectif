const error = console.error;
console.error = function(warning) {
  if (/(Invalid prop|Failed propType|Failed Context Types)/.test(warning)) {
    throw new Error(warning);
  }
  error.apply(console, arguments);
};
