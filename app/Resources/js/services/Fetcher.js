import config from '../config';
import LoginStore from '../stores/LoginStore';

function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  throw new Error(response.statusText);
}

function json(response) {
  if (response) {
    return response.json();
  }
  return {};
}

function createHeaders() {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (LoginStore.jwt !== null) {
    headers.Authorization = 'Bearer ' + LoginStore.jwt;
  }

  return headers;
}

// If shield mode is activated, Safari will override the Authorization header, so we need this
function addAuthorization(req) {
  if (LoginStore.jwt !== null) {
    const header = 'Bearer ' + LoginStore.jwt;
    req.setRequestHeader('Authorization', header);
  }
}


class Fetcher {

  get(uri) {
    return fetch(config.api + uri, {
      method: 'get',
      headers: createHeaders(),
      beforeSend: function(req) {
        addAuthorization(req);
      },
    })
    .then(status)
    .then(json);
  }

  post(uri, body) {
    return fetch(config.api + uri, {
      method: 'post',
      headers: createHeaders(),
      beforeSend: function(req) {
        addAuthorization(req);
      },
      body: JSON.stringify(body),
    })
    .then(status);
  }

  put(uri, body) {
    return fetch(config.api + uri, {
      method: 'put',
      headers: createHeaders(),
      beforeSend: function(req) {
        addAuthorization(req);
      },
      body: JSON.stringify(body),
    })
    .then(status)
  }

  delete(uri) {
    return fetch(config.api + uri, {
      method: 'delete',
      headers: createHeaders(),
      beforeSend: function(req) {
        addAuthorization(req);
      },
    })
    .then(status);
  }

}

export default new Fetcher();
