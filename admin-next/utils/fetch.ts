import gql from 'graphql-tag'
import config from './config'
import { print } from 'graphql/language/printer'
import { GraphQLTaggedNode } from 'relay-runtime'

const status = (response: Response): Response => {
  if (response.status >= 200 && response.status < 300) {
    return response
  }

  throw new Error(response.statusText)
}

export const json = (response: Response): Promise<any> => response.json()

export const createHeaders = (headers?: HeadersInit): HeadersInit => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  ...headers,
})

export const createFormDataHeaders = (headers?: HeadersInit): HeadersInit => ({
  ...headers,
})

const Fetcher = {
  graphqlFormData<T>(body: FormData): Promise<T> {
    return fetch(config.getGraphqlUrl(), {
      method: 'POST',
      credentials: 'same-origin',
      headers: createFormDataHeaders(),
      body,
    })
      .then(status)
      .then(json)
  },

  graphql<T>(body: Body): Promise<T> {
    return fetch(config.getGraphqlUrl(), {
      method: 'POST',
      credentials: 'same-origin',
      headers: createHeaders(),
      body: JSON.stringify(body),
    })
      .then(status)
      .then(json)
  },

  ssrGraphql<T, U = any>(request: GraphQLTaggedNode, variables?: U, Cookie: string = ''): Promise<T> {
    const ENV = process.env.NEXT_PUBLIC_SYMFONY_ENV || process.env.SYMFONY_ENV
    const isProd = ENV === 'prod'
    const URL = isProd
      ? 'http://127.0.0.1/graphql/internal'
      : `http://capco.${ENV === 'dev' ? 'dev' : 'test'}:8080/graphql/internal`

    return fetch(URL, {
      method: 'POST',
      credentials: 'same-origin',
      headers: createHeaders({
        Cookie,
      }),
      // @ts-ignore for now relay doesn't handle SSR so we do this manually
      body: JSON.stringify({ query: print(gql(request?.default?.params?.text)), variables }),
    })
      .then(status)
      .then(json)
      .then(e => e.data)
  },

  postFormData(uri: string, body: FormData): Promise<Response> {
    return fetch(config.getApiUrl() + uri, {
      method: 'POST',
      credentials: 'same-origin',
      headers: createFormDataHeaders(),
      body,
    }).then(status)
  },

  post(uri: string, body: Body): Promise<Response> {
    return fetch(config.getApiUrl() + uri, {
      method: 'POST',
      credentials: 'same-origin',
      headers: createHeaders(),
      body: JSON.stringify(body),
    }).then(status)
  },

  postToJson<T>(uri: string, body: Body): Promise<T> {
    return fetch(config.getApiUrl() + uri, {
      method: 'POST',
      credentials: 'same-origin',
      headers: createHeaders(),
      body: JSON.stringify(body),
    })
      .then(status)
      .then(json)
  },
}

export default Fetcher
