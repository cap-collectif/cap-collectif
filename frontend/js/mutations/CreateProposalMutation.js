// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateProposalMutationVariables,
  CreateProposalMutationResponse,
} from '~relay/CreateProposalMutation.graphql';

const mutation = graphql`
  mutation CreateProposalMutation($input: CreateProposalInput!) {
    createProposal(input: $input) {
      proposal {
        ...DraftProposalPreview_proposal @relay(mask: false)
        id
        url
        publicationStatus
        ...interpellationLabelHelper_proposal @relay(mask: false)
      }
      userErrors {
        message
      }
    }
  }
`;

const commit = (variables: {
  ...CreateProposalMutationVariables,
  stepId: string,
}): Promise<CreateProposalMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('createProposal');
      if (!payload) return;
      const proposal = payload.getLinkedRecord('proposal');
      if (!proposal) return;
      const stepProxy = store.get(variables.stepId);
      if (!stepProxy) throw new Error('Expected step to be in the store');
      // $FlowFixMe return type is mixed
      const newProposalId: ?string = proposal.getValue('id');
      if (!newProposalId) return;
      const dataID = `client:newTmpProposal:${newProposalId}`;
      const newNode = store.create(dataID, 'Proposal');
      const edgeID = `client:newTmpNode:${newProposalId}`;
      newNode.setValue(proposal.getValue('title'), 'title');
      newNode.setValue(proposal.getValue('url'), 'url');
      if (variables.input.draft) {
        const viewerProposalDrafts = stepProxy.getLinkedRecord('viewerProposalDrafts');
        if (!viewerProposalDrafts) return;
        let newEdge = store.get(edgeID);
        if (!newEdge) {
          newEdge = store.create(edgeID, 'ProposalEdge');
        }
        newEdge.setLinkedRecord(newNode, 'node');
        ConnectionHandler.insertEdgeBefore(viewerProposalDrafts, newEdge);
      }
    },
  });

export default { commit };
