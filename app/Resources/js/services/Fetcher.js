import config from '../config';
import AuthService from './AuthService';
import LocalStorageService from './LocalStorageService';

const status = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  return response.json().then((res) => {
    const error = new Error(response.statusText);
    error.response = res;
    throw error;
  });
};

export const json = response => response ? response.json() : {};

const createHeaders = () => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (LocalStorageService.isValid('jwt')) {
    headers.Authorization = `Bearer ${LocalStorageService.get('jwt')}`;
  }

  return headers;
};

const createFormDataHeaders = () => {
  const headers = {};

  if (LocalStorageService.isValid('jwt')) {
    headers.Authorization = `Bearer ${LocalStorageService.get('jwt')}`;
  }

  return headers;
};

// If shield mode is activated, Safari will override the Authorization header, so we need this
const addAuthorization = (req) => {
  if (LocalStorageService.isValid('jwt')) {
    const header = `Bearer ${LocalStorageService.get('jwt')}`;
    req.setRequestHeader('Authorization', header);
  }
};

class Fetcher {

  get(uri) {
    return AuthService.login()
      .then(() => {
        return fetch(config.api + uri, {
          method: 'get',
          headers: createHeaders(),
          beforeSend: addAuthorization,
        })
          .then(status)
          .then(json);
      })
    ;
  }

  postFormData(uri, body) {
    return AuthService.login()
      .then(() => {
        return fetch(config.api + uri, {
          method: 'post',
          headers: createFormDataHeaders(),
          beforeSend: addAuthorization,
          body,
        })
          .then(status);
      })
    ;
  }

  post(uri, body) {
    return AuthService.login()
      .then(() => {
        return fetch(config.api + uri, {
          method: 'post',
          headers: createHeaders(),
          beforeSend: addAuthorization,
          body: JSON.stringify(body),
        })
          .then(status);
      })
    ;
  }

  postToJson(uri, body) {
    return AuthService.login()
      .then(() => {
        return fetch(config.api + uri, {
          method: 'post',
          headers: createHeaders(),
          beforeSend: addAuthorization,
          body: JSON.stringify(body),
        })
          .then(status)
          .then(json);
      })
    ;
  }

  put(uri, body) {
    return AuthService.login()
      .then(() => {
        return fetch(config.api + uri, {
          method: 'put',
          headers: createHeaders(),
          beforeSend: addAuthorization,
          body: JSON.stringify(body),
        })
          .then(status);
      })
    ;
  }

  patch(uri, body) {
    return AuthService.login()
      .then(() => {
        return fetch(config.api + uri, {
          method: 'PATCH',
          headers: createHeaders(),
          beforeSend: addAuthorization,
          body: JSON.stringify(body),
        })
          .then(status);
      })
    ;
  }

  delete(uri) {
    return AuthService.login()
      .then(() => {
        return fetch(config.api + uri, {
          method: 'delete',
          headers: createHeaders(),
          beforeSend: addAuthorization,
        })
          .then(status);
      })
    ;
  }

}

export default new Fetcher();
