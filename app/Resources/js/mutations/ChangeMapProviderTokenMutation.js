// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ChangeMapProviderTokenMutationVariables,
  ChangeMapProviderTokenMutationResponse as Response,
} from './__generated__/ChangeMapProviderTokenMutation.graphql';

export type ChangeMapProviderTokenMutationResponse = Response;

const mutation = graphql`
  mutation ChangeMapProviderTokenMutation($input: ChangeMapProviderTokenInput!) {
    changeMapProviderToken(input: $input) {
      mapToken {
        ...MapboxAdminConfig_mapToken
      }
    }
  }
`;

const commit = (variables: ChangeMapProviderTokenMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
