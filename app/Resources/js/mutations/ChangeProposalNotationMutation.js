// @flow
import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import environment from '../createRelayEnvironment';
import type {
  ChangeProposalNotationMutationVariables,
  ChangeProposalNotationMutationResponse,
} from './__generated__/ChangeProposalNotationMutation.graphql';

const mutation = graphql`
  mutation ChangeProposalNotationMutation($input: ChangeProposalNotationInput!) {
    changeProposalNotation(input: $input) {
      proposal {
        ...ProposalAdminNotationForm_proposal
      }
    }
  }
`;

const commit = (
  variables: ChangeProposalNotationMutationVariables,
): Promise<ChangeProposalNotationMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
