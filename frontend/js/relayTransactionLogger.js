// @flow
/* eslint-disable no-console */
import type { LogEvent } from 'relay-runtime';

const transactionsMap = {};

const relayTransactionLogger = (event: LogEvent) => {
  if (event.name === 'execute.start') {
    const { transactionID, variables } = event;
    const { name } = event.params;

    const idName = `[${transactionID}] Relay Modern: ${name}`;
    transactionsMap[transactionID] = { idName, name, variables };

    console.time(idName);
  } else if (event.name === 'execute.error') {
    const { transactionID, error } = event;
    const { idName, name, variables } = transactionsMap[transactionID];

    console.groupCollapsed(`%c${idName}`, 'color:red');
    console.timeEnd(idName);
    console.log('GraphiQL:', name);
    console.log('Variables:', JSON.stringify(variables, null, 2));
    if (error) {
      console.log('Error:', error);
    }
    console.groupEnd();
  } else if (event.name === 'execute.next') {
    const { transactionID, response } = event;
    const { idName, name, variables } = transactionsMap[transactionID];

    console.groupCollapsed(`${idName}`);
    console.timeEnd(idName);
    console.log('GraphiQL:', name);
    console.log('Variables:', JSON.stringify(variables, null, 2));
    if (response) {
      console.log('Response:', response);
    }
    console.groupEnd();
  } else {
    console.log('RELAY: ', event);
  }
};

export default relayTransactionLogger;
