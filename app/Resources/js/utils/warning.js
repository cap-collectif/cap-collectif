// @flow
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule warning
 */

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */
function printWarning(format, ...args) {
  let argIndex = 0;
  const message = `Warning: ${format.replace(/%s/g, () => args[argIndex++])}`;
  if (typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error(message);
  }
  try {
    // This error was thrown as a convenience so that you can use this stack
    // to find the callsite that caused this warning to fire.
    throw new Error(message);
    // eslint-disable-next-line no-empty
  } catch (x) {}
}

const warning = (condition, format, ...args) => {
  if (format === undefined) {
    throw new Error('`warning(condition, format, ...args)` requires a warning message argument');
  }
  if (!condition) {
    printWarning(format, ...args);
  }
};

export default warning;
