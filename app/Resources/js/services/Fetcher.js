// @flow
import config from '../config';
import AuthService from './AuthService';
import LocalStorageService from './LocalStorageService';

const status = (response: Object): Object | Error => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  return response.json().then(res => {
    const error: Object = new Error(response.statusText);
    error.response = res;
    throw error;
  });
};

export const json = (response: Object) => response.json();

export const createHeaders = (): { [string]: string } => {
  const headers: { [string]: string } = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (LocalStorageService.isValid('jwt')) {
    headers.Authorization = `Bearer ${LocalStorageService.get('jwt')}`;
  }

  return headers;
};

export const createFormDataHeaders = () => {
  const headers = {};

  if (LocalStorageService.isValid('jwt')) {
    headers.Authorization = `Bearer ${LocalStorageService.get('jwt')}`;
  }

  return headers;
};

// If shield mode is activated, Safari will override the Authorization header, so we need this
const addAuthorization = req => {
  if (LocalStorageService.isValid('jwt')) {
    const header = `Bearer ${LocalStorageService.get('jwt')}`;
    req.setRequestHeader('Authorization', header);
  }
};

class Fetcher {
  get(uri: string): Promise<*> {
    return AuthService.login().then(() =>
      fetch(config.api + uri, {
        method: 'GET',
        headers: createHeaders(),
        beforeSend: addAuthorization,
      })
        .then(status)
        .then(json),
    );
  }

  graphqlFormData(body: FormData): Promise<*> {
    return AuthService.login().then(() =>
      fetch(config.graphql, {
        method: 'POST',
        headers: createFormDataHeaders(),
        beforeSend: addAuthorization,
        body,
      })
        .then(status)
        .then(json),
    );
  }

  graphql(body: Object) {
    return AuthService.login().then(() =>
      fetch(config.graphql, {
        method: 'POST',
        headers: createHeaders(),
        beforeSend: addAuthorization,
        body: JSON.stringify(body),
      })
        .then(status)
        .then(json),
    );
  }

  postFormData(uri: string, body: FormData): Promise<*> {
    return AuthService.login().then(() =>
      fetch(config.api + uri, {
        method: 'POST',
        headers: createFormDataHeaders(),
        beforeSend: addAuthorization,
        body,
      }).then(status),
    );
  }

  post(uri: string, body: ?Object = {}) {
    return AuthService.login().then(() =>
      fetch(config.api + uri, {
        method: 'POST',
        headers: createHeaders(),
        beforeSend: addAuthorization,
        body: JSON.stringify(body),
      }).then(status),
    );
  }

  postToJson(uri: string, body: Object) {
    return AuthService.login().then(() =>
      fetch(config.api + uri, {
        method: 'POST',
        headers: createHeaders(),
        beforeSend: addAuthorization,
        body: JSON.stringify(body),
      })
        .then(status)
        .then(json),
    );
  }

  put(uri: string, body: Object): Promise<*> {
    return AuthService.login().then(() =>
      fetch(config.api + uri, {
        method: 'PUT',
        headers: createHeaders(),
        beforeSend: addAuthorization,
        body: JSON.stringify(body),
      }).then(status),
    );
  }

  putToJson(uri: string, body: Object): Promise<*> {
    return AuthService.login().then(() =>
      fetch(config.api + uri, {
        method: 'PUT',
        headers: createHeaders(),
        beforeSend: addAuthorization,
        body: JSON.stringify(body),
      })
        .then(status)
        .then(json),
    );
  }

  patch(uri: string, body: Object): Promise<*> {
    return AuthService.login().then(() =>
      fetch(config.api + uri, {
        method: 'PATCH',
        headers: createHeaders(),
        beforeSend: addAuthorization,
        body: JSON.stringify(body),
      }).then(status),
    );
  }

  delete(uri: string): Promise<*> {
    return AuthService.login().then(() =>
      fetch(config.api + uri, {
        method: 'DELETE',
        headers: createHeaders(),
        beforeSend: addAuthorization,
      }).then(status),
    );
  }
}

export default new Fetcher();
