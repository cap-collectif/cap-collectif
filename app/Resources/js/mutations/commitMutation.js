// @flow
import { commitMutation as relayCommitMutation } from 'react-relay';
import type { Environment } from '../types';

type Config = {
  mutation: Object,
  variables: ?Object,
  uploadables?: any,
};

const commitMutation = (environment: Environment, config: Config) =>
  new Promise((resolve, reject) => {
    relayCommitMutation(environment, {
      ...config,
      onCompleted: response => resolve(response),
      onError: error => reject(error),
    });
  });

export default commitMutation;
