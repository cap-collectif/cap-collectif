// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateOpinionMutationVariables,
  CreateOpinionMutationResponse,
} from '~relay/CreateOpinionMutation.graphql';

const mutation = graphql`
  mutation CreateOpinionMutation($input: CreateOpinionInput!) {
    createOpinion(input: $input) {
      opinion {
        url
      }
      errorCode
    }
  }
`;

const commit = (
  variables: CreateOpinionMutationVariables,
): Promise<CreateOpinionMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
