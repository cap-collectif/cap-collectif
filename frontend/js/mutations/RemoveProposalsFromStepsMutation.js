// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import commitMutation from '~/mutations/commitMutation';
import environment from '~/createRelayEnvironment';
import type {
  RemoveProposalsFromStepsMutationVariables,
  RemoveProposalsFromStepsMutationResponse,
} from '~relay/RemoveProposalsFromStepsMutation.graphql';

const mutation = graphql`
  mutation RemoveProposalsFromStepsMutation($input: RemoveProposalsFromStepsInput!) {
    removeProposalsFromSteps(input: $input) {
      error
      steps {
        __typename
        id
        title
      }
    }
  }
`;

const commit = (
  variables: RemoveProposalsFromStepsMutationVariables,
): Promise<RemoveProposalsFromStepsMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticUpdater: (store: RecordSourceSelectorProxy) => {
      const stepIdsRemoved = variables.input.stepIds;

      variables.input.proposalIds.forEach(proposalId => {
        const currentProposal = store.get(proposalId);

        if (currentProposal) {
          const selections = currentProposal.getLinkedRecords('selections');

          const selectionsUpdated =
            selections?.filter(selection => {
              const isStepRemoved = stepIdsRemoved.some(
                stepId => stepId === selection?.getLinkedRecord('step')?.getValue('id'),
              );

              if (!isStepRemoved) return selection;
            }) || [];

          currentProposal.setLinkedRecords(selectionsUpdated, 'selections');
        }
      });
    },
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('removeProposalsFromSteps');
      if (!payload) return;
      const hasError = payload.getValue('error');
      if (hasError) return;

      const stepsRemoved = payload.getLinkedRecords('steps');

      variables.input.proposalIds.forEach(proposalId => {
        const currentProposal = store.get(proposalId);

        if (currentProposal) {
          const selections = currentProposal.getLinkedRecords('selections');

          if (selections) {
            const selectionsUpdated = selections.filter(selection => {
              const isStepRemoved = stepsRemoved?.some(
                stepRemoved =>
                  stepRemoved?.getValue('id') ===
                  selection?.getLinkedRecord('step')?.getValue('id'),
              );

              if (!isStepRemoved) return selection;
            });

            currentProposal.setLinkedRecords(selectionsUpdated, 'selections');
          }
        }
      });
    },
  });

export default { commit };
