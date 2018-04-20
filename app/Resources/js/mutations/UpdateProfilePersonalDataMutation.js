// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProfilePersonalDataMutationVariables,
  UpdateProfilePersonalDataMutationResponse as Response,
} from './__generated__/UpdateProfilePersonalDataMutation.graphql';

export type UpdateProfilePersonalDataMutationResponse = Response;

const mutation = graphql`
  mutation UpdateProfilePersonalDataMutation($input: UpdateProfilePersonalDataInput!) {
    updateProfilePersonalData(input: $input) {
      viewer {
        id
        username
      }
    }
  }
`;

const commit = (variables: UpdateProfilePersonalDataMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
