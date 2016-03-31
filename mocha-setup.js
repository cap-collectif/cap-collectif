const error = console.error;
console.error = function(warning) {
  if (/(Invalid prop|Failed propType)/.test(warning)) {
    throw new Error(warning);
  }
  error.apply(console, arguments);
};
