// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateSiteParameterMutationVariables,
  UpdateSiteParameterMutationResponse,
} from '~relay/UpdateSiteParameterMutation.graphql';

const mutation = graphql`
  mutation UpdateSiteParameterMutation($input: UpdateSiteParameterInput!) {
    updateSiteParameter(input: $input) {
      errorCode
      siteParameter {
        id
        keyname
        value
      }
    }
  }
`;

const commit = (
  variables: UpdateSiteParameterMutationVariables,
): Promise<UpdateSiteParameterMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
