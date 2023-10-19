import config from '../config'

const status = (response: Record<string, any>): Record<string, any> | Error => {
  if (response.status >= 200 && response.status < 300) {
    return response
  }

  return response.json().then(res => {
    const error: Record<string, any> = new Error(response.statusText)
    error.response = res
    throw error
  })
}

const status201 = (response: Record<string, any>): Record<string, any> | Error => {
  if (response.status === 201) {
    return response
  }

  return response.json().then(res => {
    const error: Record<string, any> = new Error(response.statusText)
    error.response = res
    throw error
  })
}

export const json = (response: Record<string, any>) => response.json()
export const createHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  return headers
}
export const createFormDataHeaders = () => {
  const headers = {}
  return headers
}

class Fetcher {
  graphqlFormData(body: FormData): Promise<any> {
    return fetch(config.getGraphqlUrl(), {
      method: 'POST',
      credentials: 'same-origin',
      headers: createFormDataHeaders(),
      body,
    })
      .then(status)
      .then(json)
  }

  graphql(body: Record<string, any>) {
    return fetch(config.getGraphqlUrl(), {
      method: 'POST',
      credentials: 'same-origin',
      headers: createHeaders(),
      body: JSON.stringify(body),
    })
      .then(status)
      .then(json)
  }

  postFormData(uri: string, body: FormData): Promise<any> {
    return fetch(config.getApiUrl() + uri, {
      method: 'POST',
      credentials: 'same-origin',
      headers: createFormDataHeaders(),
      body,
    }).then(status201)
  }

  post(uri: string, body: Record<string, any> | null | undefined = {}) {
    return fetch(config.getApiUrl() + uri, {
      method: 'POST',
      credentials: 'same-origin',
      headers: createHeaders(),
      body: JSON.stringify(body),
    }).then(status)
  }

  postToJson(uri: string, body: Record<string, any>) {
    return fetch(config.getApiUrl() + uri, {
      method: 'POST',
      credentials: 'same-origin',
      headers: createHeaders(),
      body: JSON.stringify(body),
    })
      .then(status)
      .then(json)
  }
}

export default new Fetcher()
