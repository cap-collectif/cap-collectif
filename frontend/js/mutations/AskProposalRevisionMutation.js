// @flow
import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import environnement from '~/createRelayEnvironment';
import type {
  AskProposalRevisionMutationVariables,
  AskProposalRevisionMutationResponse as Response,
} from '~relay/AskProposalRevisionMutation.graphql';

const mutation = graphql`
  mutation AskProposalRevisionMutation($input: AskProposalRevisionInput!) {
    askProposalRevision(input: $input) {
      errorCode
      proposal {
        ...ProposalRevision_proposal
        ...ProposalRevisionPanel_proposal
      }
    }
  }
`;

const commit = (variables: AskProposalRevisionMutationVariables): Promise<Response> =>
  commitMutation(environnement, {
    mutation,
    variables,
  });

export default { commit };
