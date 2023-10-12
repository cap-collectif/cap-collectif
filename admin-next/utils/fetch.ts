import config from './config';

const status = (response: Response): Response => {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }

    throw new Error(response.statusText);
};

export const json = (response: Response): Promise<any> => response.json();

export const createHeaders = (headers?: HeadersInit): HeadersInit => ({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...headers,
});

export const createFormDataHeaders = (headers?: HeadersInit): HeadersInit => ({
    ...headers,
});

const Fetcher = {
    graphqlFormData<T>(body: FormData): Promise<T> {
        return fetch(config.getGraphqlUrl(), {
            method: 'POST',
            credentials: 'same-origin',
            headers: createFormDataHeaders(),
            body,
        })
            .then(status)
            .then(json);
    },

    graphql<T>(body: Body): Promise<T> {
        return fetch(config.getGraphqlUrl(), {
            method: 'POST',
            credentials: 'same-origin',
            headers: createHeaders(),
            body: JSON.stringify(body),
        })
            .then(status)
            .then(json);
    },

    postFormData(uri: string, body: FormData): Promise<Response> {
        return fetch(config.getApiUrl() + uri, {
            method: 'POST',
            credentials: 'same-origin',
            headers: createFormDataHeaders(),
            body,
        }).then(status);
    },

    post(uri: string, body: Body): Promise<Response> {
        return fetch(config.getApiUrl() + uri, {
            method: 'POST',
            credentials: 'same-origin',
            headers: createHeaders(),
            body: JSON.stringify(body),
        }).then(status);
    },

    postToJson<T>(uri: string, body: Body): Promise<T> {
        return fetch(config.getApiUrl() + uri, {
            method: 'POST',
            credentials: 'same-origin',
            headers: createHeaders(),
            body: JSON.stringify(body),
        })
            .then(status)
            .then(json);
    },
};

export default Fetcher;
