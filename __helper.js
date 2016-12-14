import {
  EXPECTED_COLOR,
  RECEIVED_COLOR,
  matcherHint,
  printReceived,
  printExpected,
  printWithType,
} from 'jest-matcher-utils';
import diff from 'jest-diff';

// Temporary, comming next week :smile:
expect.extend({
  toMatchObject(receivedObject: Object, expectedObject: Object) {
    if (typeof receivedObject !== 'object' || receivedObject === null) {
      throw new Error(
        `${matcherHint('[.not].toMatchObject', 'object', 'expected')}\n\n${RECEIVED_COLOR('received')} value must be an object.\n${printWithType('Received', receivedObject, printReceived)}`,
      );
    }
    if (typeof expectedObject !== 'object' || expectedObject === null) {
      throw new Error(
        `${matcherHint('[.not].toMatchObject', 'object', 'expected')}\n\n${EXPECTED_COLOR('expected')} value must be an object.\n${printWithType('Expected', expectedObject, printExpected)}`,
      );
    }
    const compare = (expected: any, received: any): boolean => {
      if (typeof received !== typeof expected) {
        return false;
      }
      if (typeof expected !== 'object' || expected === null) {
        return expected === received;
      }
      if (Array.isArray(expected)) {
        if (!Array.isArray(received)) {
          return false;
        }
        if (expected.length !== received.length) {
          return false;
        }
        return expected.every(exp => {
          return received.some(act => {
            return compare(exp, act);
          });
        });
      }
      if (expected instanceof Date && received instanceof Date) {
        return expected.getTime() === received.getTime();
      }
      return Object.keys(expected).every(key => {
        if (!received.hasOwnProperty(key)) {
          return false;
        }
        const exp = expected[key];
        const act = received[key];
        if (typeof exp === 'object' && exp !== null && act !== null) {
          return compare(exp, act);
        }
        return act === exp;
      });
    };
    // Strip properties form received object that are not present in the expected
    // object. We need it to print the diff without adding a lot of unrelated noise.
    const findMatchObject = (expected: Object, received: Object) => {
      if (Array.isArray(received)) {
        if (!Array.isArray(expected)) {
          return received;
        }
        if (expected.length !== received.length) {
          return received;
        }
        const matchArray = [];
        for (let i = 0; i < expected.length; i++) {
          matchArray.push(findMatchObject(expected[i], received[i]));
        }
        return matchArray;
      } else if (received instanceof Date) {
        return received;
      } else if (typeof received === 'object' && received !== null && typeof expected === 'object' && expected !== null) {
        const matchedObject = {};
        let match = false;
        Object.keys(expected).forEach(key => {
          if (received.hasOwnProperty(key)) {
            match = true;
            const exp = expected[key];
            const act = received[key];
            if (typeof exp === 'object' && exp !== null) {
              matchedObject[key] = findMatchObject(exp, act);
            } else {
              matchedObject[key] = act;
            }
          }
        });
        if (match) {
          return matchedObject;
        } else {
          return received;
        }
      } else {
        return received;
      }
    };
    const pass = compare(expectedObject, receivedObject);
    const message = pass
      ? () => `${matcherHint('.not.toMatchObject')
     }\n\nExpected value not to match object:\n` +
     `  ${printExpected(expectedObject)}` +
     `\nReceived:\n` +
     `  ${printReceived(receivedObject)}`
       : () => {
         const diffString = diff(expectedObject, findMatchObject(expectedObject, receivedObject), {
           expand: this.expand,
         });
         return `${matcherHint('.toMatchObject')
         }\n\nExpected value to match object:\n` +
         `  ${printExpected(expectedObject)}` +
         `\nReceived:\n` +
         `  ${printReceived(receivedObject)}${
         diffString ? `\nDifference:\n${diffString}` : ''}`;
       };
    return { message, pass };
  },
});
