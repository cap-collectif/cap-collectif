// @flow
import {
  commitMutation as relayCommitMutation,
  type Environment,
  type MutationConfig
} from 'react-relay';

const commitMutation = (environment: Environment, config: MutationConfig<*>): Promise<any> =>
  new Promise((resolve, reject) => {
    relayCommitMutation(environment, {
      ...config,
      onCompleted: (response: ?Object) => resolve(response),
      onError: (error: Error) => reject(error)
    });
  });

export default commitMutation;
