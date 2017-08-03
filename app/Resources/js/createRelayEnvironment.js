// @flow
import React from 'react';
import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import { createHeaders, createFormDataHeaders } from './services/Fetcher';
import { graphQLUrl } from './config';

// See https://github.com/facebook/relay/issues/1844
function fetchQuery(operation, variables, cacheConfig, uploadables) {
  console.log(operation, variables, cacheConfig, uploadables);
  const request = {
    method: 'POST',
    headers: undefined,
    body: undefined,
  };

  if (uploadables) {
    if (!window.FormData) {
      throw new Error('Uploading files without `FormData` not supported.');
    }

    request.headers = createFormDataHeaders();
    const formData = new FormData();
    formData.append('operationName', operation.name);
    formData.append('query', operation.text);
    formData.append('variables', JSON.stringify(variables));

    Object.keys(uploadables).forEach(key => {
      if (Object.prototype.hasOwnProperty.call(uploadables, key)) {
        formData.append(key, uploadables[key]);
      }
    });

    request.body = formData;
  } else {
    request.headers = createHeaders();
    request.body = JSON.stringify({
      operationName: operation.name,
      query: operation.text,
      variables,
    });
  }

  return fetch(graphQLUrl, request)
    .then(response => {
      if (response.status === 200) {
        return response.json();
      }
      // HTTP errors
      // TODO: NOT sure what to do here yet
      return response.json();
    })
    .catch(error => {
      console.log(error);
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
