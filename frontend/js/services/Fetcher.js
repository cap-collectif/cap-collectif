// @flow
import config from '../config';

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
  return headers;
};

export const createFormDataHeaders = () => {
  const headers = {};

  return headers;
};

class Fetcher {
  get(uri: string): Promise<*> {
    return fetch(config.api + uri, {
      method: 'GET',
      credentials: 'same-origin',
      headers: createHeaders(),
    })
      .then(status)
      .then(json);
  }

  graphqlFormData(body: FormData): Promise<*> {
    return fetch(config.graphql, {
      method: 'POST',
      credentials: 'same-origin',
      headers: createFormDataHeaders(),
      body,
    })
      .then(status)
      .then(json);
  }

  graphql(body: Object) {
    return fetch(config.graphql, {
      method: 'POST',
      credentials: 'same-origin',
      headers: createHeaders(),
      body: JSON.stringify(body),
    })
      .then(status)
      .then(json);
  }

  postFormData(uri: string, body: FormData): Promise<*> {
    return fetch(config.api + uri, {
      method: 'POST',
      credentials: 'same-origin',
      headers: createFormDataHeaders(),
      body,
    }).then(status);
  }

  post(uri: string, body: ?Object = {}) {
    return fetch(config.api + uri, {
      method: 'POST',
      credentials: 'same-origin',
      headers: createHeaders(),
      body: JSON.stringify(body),
    }).then(status);
  }

  postToJson(uri: string, body: Object) {
    return fetch(config.api + uri, {
      method: 'POST',
      credentials: 'same-origin',
      headers: createHeaders(),
      body: JSON.stringify(body),
    })
      .then(status)
      .then(json);
  }

  put(uri: string, body: Object): Promise<*> {
    return fetch(config.api + uri, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: createHeaders(),
      body: JSON.stringify(body),
    }).then(status);
  }

  putToJson(uri: string, body: Object): Promise<*> {
    return fetch(config.api + uri, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: createHeaders(),
      body: JSON.stringify(body),
    })
      .then(status)
      .then(json);
  }

  patch(uri: string, body: Object): Promise<*> {
    return fetch(config.api + uri, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: createHeaders(),
      body: JSON.stringify(body),
    }).then(status);
  }

  delete(uri: string): Promise<*> {
    return fetch(config.api + uri, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: createHeaders(),
    }).then(status);
  }
}

export default new Fetcher();
