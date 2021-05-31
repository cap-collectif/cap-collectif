// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RegisterEmailDomainsMutationVariables,
  RegisterEmailDomainsMutationResponse,
} from '~relay/RegisterEmailDomainsMutation.graphql';

const mutation = graphql`
  mutation RegisterEmailDomainsMutation($input: RegisterEmailDomainsInput!) {
    registerEmailDomains(input: $input) {
      domains {
        value
      }
    }
  }
`;

const commit = (
  variables: RegisterEmailDomainsMutationVariables,
): Promise<RegisterEmailDomainsMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
