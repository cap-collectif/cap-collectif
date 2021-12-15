// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddProposalsFromCsvMutationVariables,
  AddProposalsFromCsvMutationResponse,
} from '~relay/AddProposalsFromCsvMutation.graphql';
import type { ProjectAdminPageParameters } from '~/components/Admin/Project/ProjectAdminPage.reducer';

const mutation = graphql`
  mutation AddProposalsFromCsvMutation(
    $input: AddProposalsFromCsvInput!
    $proposalRevisionsEnabled: Boolean!
    $isAdminView: Boolean!
    $step: ID!
  ) {
    addProposalsFromCsv(input: $input) {
      badLines
      duplicates
      mandatoryMissing
      importableProposals
      importedProposals {
        totalCount
      }
      importedProposalsArray {
        form {
          step {
            id
            title
          }
        }
        selections {
          step {
            id
            title
          }
        }
        status(step: $step) {
          id
          name
          color
        }
        proposalVotes: votes(stepId: $step) {
          totalCount
          totalPointsCount
        }
        district {
          id
          name
        }
        ...AnalysisProposal_proposal
          @arguments(isAdminView: $isAdminView, proposalRevisionsEnabled: $proposalRevisionsEnabled)
      }
      project {
        steps {
          __typename
          id
          title
          label
          # ProposalStep could be used here for CollectStep & SelectionStep
          # but relay-hooks doesn't retrieve this in store when preloading
          ... on CollectStep {
            votable
            votesRanking
            statuses {
              id
              name
              color
            }
            form {
              id
              usingThemes
              districts {
                id
                name
              }
              categories {
                id
                name
              }
            }
          }
          ... on SelectionStep {
            votable
            votesRanking
            statuses {
              id
              name
              color
            }
            form {
              id
              usingThemes
              districts {
                id
                name
              }
              categories {
                id
                name
              }
            }
          }
        }
        proposalsAll: proposals(state: ALL) {
          totalCount
        }
        proposalsPublished: proposals(state: PUBLISHED) {
          totalCount
        }
        proposalsDraft: proposals(state: DRAFT) {
          totalCount
        }
        proposalsTrashed: proposals(state: TRASHED) {
          totalCount
        }
      }
      errorCode
    }
  }
`;

type Variables = {
  ...AddProposalsFromCsvMutationVariables,
  projectId?: string,
  parameters?: ProjectAdminPageParameters,
};

const commit = (variables: Variables): Promise<AddProposalsFromCsvMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const { parameters, input, projectId } = variables;
      const { dryRun } = input;
      if (dryRun) {
        return;
      }
      if (!parameters || !projectId) return;

      const project = store.get(projectId);
      if (!project) return;
      // Get connection record
      const proposalConnection = ConnectionHandler.getConnection(
        project,
        'ProjectAdminProposals_proposals',
        {
          orderBy: {
            field: 'PUBLISHED_AT',
            direction: parameters.sort === 'newest' ? 'DESC' : 'ASC',
          },
          state: parameters.filters.state,
          category: parameters.filters.category === 'ALL' ? null : parameters.filters.category,
          district: parameters.filters.district === 'ALL' ? null : parameters.filters.district,
          status: parameters.filters.status === 'ALL' ? null : parameters.filters.status,
          step: parameters.filters.step || null,
          term: parameters.filters.term,
        },
      );
      if (!proposalConnection) return;
      const payload = store.getRootField('addProposalsFromCsv');
      if (!payload) return;
      const importedProposalsArray = payload.getLinkedRecords('importedProposalsArray');
      if (!importedProposalsArray) return;
      const projectProxy = store.get(projectId);
      if (!projectProxy) return;

      importedProposalsArray.map(proposal => {
        if (!proposal) return;
        // $FlowFixMe return type is mixed
        const newProposalId: ?string = proposal.getValue('id');
        if (!newProposalId) return;

        const dataID = `client:newTmpProposal:${newProposalId}`;
        const newNode = store.create(dataID, 'Proposal');
        const edgeID = `client:newTmpNode:${newProposalId}`;
        newNode.setValue(proposal.getValue('title'), 'title');
        newNode.copyFieldsFrom(proposal);
        let newEdge = store.get(edgeID);
        if (!newEdge) {
          newEdge = store.create(edgeID, 'ProposalEdge');
        }
        newEdge.setLinkedRecord(newNode, 'node');
        const proposalsCount = parseInt(proposalConnection.getValue('totalCount'), 10);
        proposalConnection.setValue(proposalsCount + importedProposalsArray.length, 'totalCount');
        ConnectionHandler.insertEdgeBefore(proposalConnection, newEdge);
      });
    },
  });

export default { commit };
