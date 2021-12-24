import {
    Environment,
    MutationConfig,
    MutationParameters,
    commitMutation as relayCommitMutation,
  } from 'relay-runtime';

function commitMutation<TOperation extends MutationParameters = MutationParameters>(environment: Environment, config: MutationConfig<TOperation>): Promise<TOperation['response']> {
    return new Promise((resolve, reject) => {
        relayCommitMutation<TOperation>(environment, {
            ...config,
            onCompleted: (response, errors) => {
                if (errors) {
                    return reject(errors[0]);
                }
                return resolve(response);
            },
            onError: (error: Error) => reject(error),
        });
    });
};

export default commitMutation;
