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
  mutation CreateProposalMutation($input: CreateProposalInput!, $stepId: ID!) {
    createProposal(input: $input) {
      proposal {
        ...DraftProposalPreview_proposal @relay(mask: false)
        ...ProposalPreview_proposal
          @arguments(stepId: $stepId, isAuthenticated: true, isProfileView: false)
        ...ProposalLeafletMap_proposals
        id
        url
        publicationStatus
        reference
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
      newNode.setValue(proposal.getValue('slug'), 'slug');
      let newEdge = store.get(edgeID);
      if (!newEdge) {
        newEdge = store.create(edgeID, 'ProposalEdge');
      }
      if (variables.input.draft) {
        newNode.copyFieldsFrom(proposal);
        newEdge.setLinkedRecord(newNode, 'node');
        const viewerProposalDrafts = stepProxy.getLinkedRecord('viewerProposalDrafts');
        if (!viewerProposalDrafts) return;
        ConnectionHandler.insertEdgeBefore(viewerProposalDrafts, newEdge);
      } else {
        const gridConnection = ConnectionHandler.getConnection(
          stepProxy,
          'ProposalListViewPaginated_proposals',
        );
        const mapConnection = ConnectionHandler.getConnection(
          stepProxy,
          'ProposalsDisplayMap_proposals',
        );
        newNode.copyFieldsFrom(proposal);
        newEdge.setLinkedRecord(newNode, 'node');
        const allProposals = stepProxy.getLinkedRecord('proposals', { first: 0 });
        if (allProposals) {
          const allProposalsCount = parseInt(allProposals.getValue('totalCount'), 10);
          allProposals.setValue(allProposalsCount + 1, 'totalCount');
        }
        const proposalHeaderConnection = ConnectionHandler.getConnection(
          stepProxy,
          'ProposalStepPageHeader_proposals',
        );
        if (proposalHeaderConnection) {
          const proposalsCount = parseInt(proposalHeaderConnection.getValue('totalCount'), 10);
          proposalHeaderConnection.setValue(proposalsCount + 1, 'totalCount');
        }
        if (gridConnection) {
          ConnectionHandler.insertEdgeBefore(gridConnection, newEdge);
          const proposalsGridCount = parseInt(gridConnection.getValue('totalCount'), 10);
          gridConnection.setValue(proposalsGridCount + 1, 'totalCount');
        }
        if (mapConnection) {
          ConnectionHandler.insertEdgeBefore(mapConnection, newEdge);
        }
      }
    },
  });

export default { commit };
