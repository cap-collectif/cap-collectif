// @flow
import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import environment from '../createRelayEnvironment';
import type {
  ChangeProposalEvaluersMutationVariables,
  ChangeProposalEvaluersMutationResponse,
} from './__generated__/ChangeProposalEvaluersMutation.graphql';

const mutation = graphql`
  mutation ChangeProposalEvaluersMutation($input: ChangeProposalEvaluersInput!) {
    changeProposalEvaluers(input: $input) {
      proposal {
        ...ProposalAdminEvaluersForm_proposal
      }
    }
  }
`;

const commit = (
  variables: ChangeProposalEvaluersMutationVariables,
): Promise<ChangeProposalEvaluersMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
