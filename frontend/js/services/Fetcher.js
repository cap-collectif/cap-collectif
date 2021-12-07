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

const status201 = (response: Object): Object | Error => {
  if (response.status === 201) {
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
  graphqlFormData(body: FormData): Promise<*> {
    return fetch(config.getGraphqlInternalUrl(), {
      method: 'POST',
      credentials: 'same-origin',
      headers: createFormDataHeaders(),
      body,
    })
      .then(status)
      .then(json);
  }

  graphql(body: Object) {
    return fetch(config.getGraphqlInternalUrl(), {
      method: 'POST',
      // For `admin-next.capco.dev` we need to include cookies even if not on the same origin.
      credentials: config.isDev ? 'include' : 'same-origin',
      headers: createHeaders(),
      body: JSON.stringify(body),
    })
      .then(status)
      .then(json);
  }

  postFormData(uri: string, body: FormData): Promise<*> {
    return fetch(config.getApiUrl() + uri, {
      method: 'POST',
      credentials: 'same-origin',
      headers: createFormDataHeaders(),
      body,
    }).then(status201);
  }

  post(uri: string, body: ?Object = {}) {
    return fetch(config.getApiUrl() + uri, {
      method: 'POST',
      credentials: 'same-origin',
      headers: createHeaders(),
      body: JSON.stringify(body),
    }).then(status);
  }

  postToJson(uri: string, body: Object) {
    return fetch(config.getApiUrl() + uri, {
      method: 'POST',
      credentials: 'same-origin',
      headers: createHeaders(),
      body: JSON.stringify(body),
    })
      .then(status)
      .then(json);
  }
}

export default new Fetcher();
