import Fetcher from '../utils/fetch';

const executeFunction = (
    operation: any,
    variables: any,
    cacheConfig: any,
    uploadables: null | undefined | any,
) => {
    if (uploadables) {
        if (!window.FormData) {
            throw new Error('Uploading files without `FormData` not supported.');
        }

        const formData = new FormData();
        formData.append('operationName', operation.name);
        formData.append('query', operation.text);
        formData.append('variables', JSON.stringify(variables));
        Object.keys(uploadables).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(uploadables, key)) {
                formData.append(key, uploadables[key]);
            }
        });

        return Fetcher.graphqlFormData(formData);
    }

    return Fetcher.graphql({
        // @ts-ignore fixme
        operationName: operation.name,
        query: operation.text,
        variables,
    });
};

export default executeFunction;
