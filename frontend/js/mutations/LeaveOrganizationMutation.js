// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  LeaveOrganizationMutationVariables,
  LeaveOrganizationMutationResponse,
} from '~relay/LeaveOrganizationMutation.graphql';

const mutation = graphql`
  mutation LeaveOrganizationMutation($input: LeaveOrganizationInput!) {
    leaveOrganization(input: $input) {
      errorCode
    }
  }
`;

const commit = (
  variables: LeaveOrganizationMutationVariables,
): Promise<LeaveOrganizationMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
