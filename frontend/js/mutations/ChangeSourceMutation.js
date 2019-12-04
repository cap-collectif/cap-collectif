// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ChangeSourceMutationVariables,
  ChangeSourceMutationResponse,
} from '~relay/ChangeSourceMutation.graphql';

const mutation = graphql`
  mutation ChangeSourceMutation($input: ChangeSourceInput!) {
    changeSource(input: $input) {
      source {
        id
        ...OpinionSource_source
      }
    }
  }
`;

const commit = (variables: ChangeSourceMutationVariables): Promise<ChangeSourceMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
