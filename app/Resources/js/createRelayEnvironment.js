import { Environment, Network, RecordSource, Store } from 'relay-runtime';

// Define a function that fetches the results of an operation (query/mutation/etc)
// and returns its results as a Promise:
function fetchQuery(operation, variables) {
  console.log(operation, variables);
  return fetch(
    `${typeof window !== 'undefined' ? window.location.protocol : 'http'}//${typeof window !== 'undefined' ? window.location.host : 'capco.test'}/graphql/`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        // Add authentication and other headers here
      },
      body: JSON.stringify({
        operationName: operation.name,
        query: operation.text,
        variables,
      }),
    },
  ).then(response => {
    return response.json();
  });
}

// Create a network layer from the fetch function
const network = Network.create(fetchQuery);

const source = new RecordSource();
const store = new Store(source);

export default new Environment({
  network,
  store,
});
