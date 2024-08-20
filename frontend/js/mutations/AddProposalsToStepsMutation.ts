// @ts-nocheck
import { graphql } from 'react-relay'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import commitMutation from '~/mutations/commitMutation'
import environment from '~/createRelayEnvironment'
import type {
  AddProposalsToStepsMutationVariables,
  AddProposalsToStepsMutationResponse,
} from '~relay/AddProposalsToStepsMutation.graphql'
import uuid from '@shared/utils/uuid'
import type { StepFilter } from '~/components/Admin/Project/ProjectAdminProposals.utils'

type Variables = AddProposalsToStepsMutationVariables & {
  allSteps: ReadonlyArray<StepFilter>
}
const mutation = graphql`
  mutation AddProposalsToStepsMutation($input: AddProposalsToStepsInput!) {
    addProposalsToSteps(input: $input) {
      error
      steps {
        __typename
        id
        title
      }
    }
  }
`

const commit = (variables: Variables): Promise<AddProposalsToStepsMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticUpdater: (store: RecordSourceSelectorProxy) => {
      const stepIdsAdded = variables.input.stepIds
      variables.input.proposalIds.forEach(proposalId => {
        const currentProposal = store.get(proposalId)

        if (currentProposal) {
          const selections = currentProposal.getLinkedRecords('selections')

          if (selections) {
            const selectionsAdded = stepIdsAdded.map((stepId, idx) => {
              const selectionCreated = store.create(`proposal-selection-${uuid()}-${idx}`, 'ProposalSelection')
              const dataStepSelected = variables.allSteps.find(step => stepId === step.id)
              const stepAdded = store.create(`step-${uuid()}`, 'SelectionStep')
              stepAdded.setValue(dataStepSelected?.type, '__typename')
              stepAdded.setValue(dataStepSelected?.id, 'id')
              stepAdded.setValue(dataStepSelected?.title, 'title')
              selectionCreated.setLinkedRecord(stepAdded, 'step')
              return selectionCreated
            })
            currentProposal.setLinkedRecords([...selections, ...selectionsAdded], 'selections')
          }
        }
      })
    },
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('addProposalsToSteps')
      if (!payload) return
      const hasError = payload.getValue('error')
      if (hasError) return
      const stepsUpdated = payload.getLinkedRecords('steps')
      variables.input.proposalIds.forEach(proposalId => {
        const currentProposal = store.get(proposalId)

        if (currentProposal) {
          const selections = currentProposal.getLinkedRecords('selections')

          if (selections) {
            const selectionsAdded =
              stepsUpdated?.filter(Boolean).map((step, idx) => {
                const selectionCreated = store.create(`proposal-selection-${uuid()}-${idx}`, 'ProposalSelection')
                selectionCreated.setLinkedRecord(step, 'step')
                return selectionCreated
              }) || []
            currentProposal.setLinkedRecords([...selections, ...selectionsAdded], 'selections')
          }
        }
      })
    },
  })

export default {
  commit,
}
