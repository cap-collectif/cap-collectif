import config from '../config';
import LoginStore from '../stores/LoginStore';

const status = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
};

const json = (response) => response ? response.json() : {};

const createHeaders = () => {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (LoginStore.jwt !== null) {
    headers.Authorization = 'Bearer ' + LoginStore.jwt;
  }

  return headers;
};

// If shield mode is activated, Safari will override the Authorization header, so we need this
const addAuthorization = (req) => {
  if (LoginStore.jwt !== null) {
    const header = 'Bearer ' + LoginStore.jwt;
    req.setRequestHeader('Authorization', header);
  }
};

class Fetcher {

  get(uri) {
    return fetch(config.api + uri, {
      method: 'get',
      headers: createHeaders(),
      beforeSend: addAuthorization,
    })
    .then(status)
    .then(json);
  }

  post(uri, body) {
    return fetch(config.api + uri, {
      method: 'post',
      headers: createHeaders(),
      beforeSend: addAuthorization,
      body: JSON.stringify(body),
    })
    .then(status);
  }

  put(uri, body) {
    return fetch(config.api + uri, {
      method: 'put',
      headers: createHeaders(),
      beforeSend: addAuthorization,
      body: JSON.stringify(body),
    })
    .then(status);
  }

  delete(uri) {
    return fetch(config.api + uri, {
      method: 'delete',
      headers: createHeaders(),
      beforeSend: addAuthorization,
    })
    .then(status);
  }

}

export default new Fetcher();
