// @ts-nocheck
import { graphql } from 'react-relay'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import commitMutation from '~/mutations/commitMutation'
import environment from '~/createRelayEnvironment'
import type {
  ApplyProposalStatusMutationVariables,
  ApplyProposalStatusMutationResponse,
} from '~relay/ApplyProposalStatusMutation.graphql'
import type { ProposalsStepValues } from '~/components/Admin/Project/ProjectAdminPage.reducer'
import type { StepStatusFilter } from '~/components/Admin/Project/ProjectAdminProposals.utils'

type Variables = ApplyProposalStatusMutationVariables & {
  step: ProposalsStepValues
  statusSelected: StepStatusFilter | null | undefined
}
const mutation = graphql`
  mutation ApplyProposalStatusMutation($input: ApplyProposalStatusInput!) {
    applyProposalStatus(input: $input) {
      error
      status {
        id
        name
        color
      }
    }
  }
`

const commit = (variables: Variables): Promise<ApplyProposalStatusMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticUpdater: (store: RecordSourceSelectorProxy) => {
      variables.input.proposalIds.forEach(proposalId => {
        const currentProposal = store.get(proposalId)

        if (currentProposal) {
          if (variables.statusSelected) {
            const proposalStepStatusUpdated = store.get(variables.statusSelected.id)
            if (!proposalStepStatusUpdated) return
            currentProposal.setLinkedRecord(proposalStepStatusUpdated, 'status', {
              step: variables.step,
            })
          } else {
            currentProposal.setValue(null, 'status', {
              step: variables.step,
            })
          }
        }
      })
    },
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('applyProposalStatus')
      if (!payload) return
      const hasError = payload.getValue('error')
      if (hasError) return
      const statusUpdated = payload.getLinkedRecord('status')
      variables.input.proposalIds.forEach(proposalId => {
        const currentProposal = store.get(proposalId)

        if (currentProposal) {
          if (statusUpdated) {
            currentProposal.setLinkedRecord(statusUpdated, 'status', {
              step: variables.step,
            })
          } else {
            currentProposal.setValue(null, 'status', {
              step: variables.step,
            })
          }
        }
      })
    },
  })

export default {
  commit,
}
