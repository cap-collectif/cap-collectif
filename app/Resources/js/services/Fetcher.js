'use strict';

import config from '../config';
import LoginStore from '../stores/LoginStore';

function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  throw new Error(response.statusText);
};

function json(response) {
   return response.json()
};

function createHeaders() {
  var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  if(LoginStore.jwt != null) {
     headers.Authorization = 'Bearer ' + LoginStore.jwt;
  }

  return headers;
}


class Fetcher {

  get(uri) {
    return fetch(config.api + uri, {
      method: 'get',
      headers: createHeaders()
    })
    .then(status)
    .then(json);
  }

  post(uri, body) {
    return fetch(config.api + uri, {
        method: 'post',
        headers: createHeaders(),
        body: JSON.stringify(body)
      })
      .then(status)
  }

  put(uri, body) {
    return fetch(config.api + uri, {
        method: 'put',
        headers: createHeaders(),
        body: JSON.stringify(body)
      })
      .then(status)
      .then(json);
  }

  delete(uri) {
    return fetch(config.api + uri, {
      method: 'delete',
      headers: createHeaders()
    })
    .then(status)
    .then(json);
  }

}

export default new Fetcher();
