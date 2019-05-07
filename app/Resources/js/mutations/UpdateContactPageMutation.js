// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateContactPageMutationVariables,
  UpdateContactPageMutationResponse,
} from '~relay/SetEvaluationFormInProposalFormMutation.graphql';

const mutation = graphql`
  mutation UpdateContactPageMutation($input: UpdateContactPageInput!) {
    updateContactPage(input: $input) {
      title
      description
    }
  }
`;

const commit = (
  variables: UpdateContactPageMutationVariables,
): Promise<UpdateContactPageMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
