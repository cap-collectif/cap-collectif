// @flow
import React from 'react';
import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import Fetcher, { json } from './services/Fetcher';

function fetchQuery(operation, variables, cacheConfig, uploadables) {
  if (uploadables) {
    if (!window.FormData) {
      throw new Error('Uploading files without `FormData` not supported.');
    }

    const formData = new FormData();
    formData.append('operationName', operation.name);
    formData.append('query', operation.text);
    formData.append('variables', JSON.stringify(variables));
    Object.keys(uploadables).forEach(key => {
      if (Object.prototype.hasOwnProperty.call(uploadables, key)) {
        formData.append(key, uploadables[key]);
      }
    });

    return Fetcher.graphqlFormData(formData).then(json);
  }

  return Fetcher.graphql({
    operationName: operation.name,
    query: operation.text,
    variables,
  });
}

export const graphqlError = (
  <p className="text-danger">
    Désolé une erreur s'est produite… Réessayez plus tard.
  </p>
);

export default new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});
