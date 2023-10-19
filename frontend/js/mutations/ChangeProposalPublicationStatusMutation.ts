// @ts-nocheck
import { graphql } from 'react-relay'
import { ConnectionHandler } from 'relay-runtime'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  ChangeProposalPublicationStatusMutationVariables,
  ChangeProposalPublicationStatusMutationResponse,
} from '~relay/ChangeProposalPublicationStatusMutation.graphql'
import type { ProjectAdminPageParameters } from '~/components/Admin/Project/ProjectAdminPage.reducer'
type Variables = ChangeProposalPublicationStatusMutationVariables & {
  isAnalysis?: boolean
  parametersConnection?: ProjectAdminPageParameters
  parentConnectionId?: string
  readonly author: {
    readonly id: string
    readonly isEmailConfirmed: boolean | null | undefined
    readonly email: string | null | undefined
    readonly isViewer: boolean
  }
}
const mutation = graphql`
  mutation ChangeProposalPublicationStatusMutation(
    $input: ChangeProposalPublicationStatusInput!
    $viewerIsAdmin: Boolean!
  ) {
    changeProposalPublicationStatus(input: $input) {
      proposal {
        ...ProposalAdminStatusForm_proposal @arguments(viewerIsAdmin: $viewerIsAdmin)
      }
    }
  }
`

const updater = (variables: Variables, store: RecordSourceSelectorProxy) => {
  const { parametersConnection: parameters, input, parentConnectionId } = variables
  if (!parameters || !parentConnectionId) return
  const project = store.get(parentConnectionId)
  if (!project) return
  const proposals = ConnectionHandler.getConnection(project, 'ProjectAdminProposals_proposals', {
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
  })
  if (!proposals) return
  ConnectionHandler.deleteNode(proposals, input.proposalId)
  const countProposals = proposals.getValue('totalCount') as any as number
  proposals.setValue(countProposals - 1, 'totalCount')
  // Update count current state
  const proposalsCurrentState = project.getLinkedRecord('proposals', {
    state: parameters.filters.state,
  })

  if (proposalsCurrentState) {
    proposalsCurrentState.setValue(proposals.getValue('totalCount') as any as number, 'totalCount')
  }

  // Update count trash
  const proposalsTrashed = project.getLinkedRecord('proposals', {
    state: 'TRASHED',
  })

  if (proposalsTrashed) {
    const countProposalsTrashed = proposalsTrashed.getValue('totalCount') as any as number
    proposalsTrashed.setValue(countProposalsTrashed + 1, 'totalCount')
  }
}

const updaterAnalysis = (variables: Variables, store: RecordSourceSelectorProxy) => {
  const { parametersConnection: parameters, input, parentConnectionId } = variables
  if (!parameters || !parentConnectionId) return
  const analysisStep = store.get(parentConnectionId)
  if (!analysisStep) return
  const proposals = ConnectionHandler.getConnection(analysisStep, 'ProjectAdminAnalysis_proposals', {
    orderBy: {
      field: 'PUBLISHED_AT',
      direction: parameters.sort === 'newest' ? 'DESC' : 'ASC',
    },
    category: parameters.filters.category === 'ALL' ? null : parameters.filters.category,
    district: parameters.filters.district === 'ALL' ? null : parameters.filters.district,
    term: parameters.filters.term,
    analysts: parameters.filters.analysts.length > 0 ? parameters.filters.analysts : null,
    supervisor: parameters.filters.supervisor,
    decisionMaker: parameters.filters.decisionMaker,
    progressStatus: parameters.filters.progressState === 'ALL' ? null : parameters.filters.progressState,
  })
  if (!proposals) return
  ConnectionHandler.deleteNode(proposals, input.proposalId)
  const countProposals = proposals.getValue('totalCount') as any as number
  proposals.setValue(countProposals - 1, 'totalCount')
}

const commit = (variables: Variables): Promise<ChangeProposalPublicationStatusMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      changeProposalPublicationStatus: {
        proposal: {
          author: variables.author,
          deletedAt: null,
          id: variables.input.proposalId,
          publicationStatus: variables.input.publicationStatus,
          trashedReason: variables.input.trashedReason || null,
        },
      },
    },
    updater: (store: RecordSourceSelectorProxy) =>
      variables.isAnalysis ? updaterAnalysis(variables, store) : updater(variables, store),
    optimisticUpdater: (store: RecordSourceSelectorProxy) =>
      variables.isAnalysis ? updaterAnalysis(variables, store) : updater(variables, store),
  })

export default {
  commit,
}
