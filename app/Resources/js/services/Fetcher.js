'use strict';

import config from '../config';

function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  throw new Error(response.statusText)
};

function json(response) {
   return response.json()
};

function createHeaders() {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
}


class Fetcher {

  get(uri) {
    return fetch(config.api + uri, {
      method: 'get',
      credentials: 'same-origin',
      headers: createHeaders()
    })
    .then(status)
    .then(json);
  }

  post(uri, body) {
    return fetch(config.api + uri, {
        method: 'post',
        credentials: 'same-origin',
        headers: createHeaders(),
        body: JSON.stringify(body)
      })
      .then(status)
      .then(json);
  }

  put(uri, body) {
    return fetch(config.api + uri, {
        method: 'put',
        credentials: 'same-origin',
        headers: createHeaders(),
        body: JSON.stringify(body)
      })
      .then(status)
      .then(json);
  }

  delete(uri) {
    return fetch(config.api + uri, {
      method: 'delete',
      credentials: 'same-origin',
      headers: createHeaders()
    })
    .then(status)
    .then(json);
  }

}

export default new Fetcher();
