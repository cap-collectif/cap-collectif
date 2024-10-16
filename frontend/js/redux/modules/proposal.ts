import { toast } from '@cap-collectif/ui'
import { toast as oldToast } from '~ds/Toast'

import type { IntlShape } from 'react-intl'
import AddProposalVoteMutation from '../../mutations/AddProposalVoteMutation'
import AddProposalSmsVoteMutation from '../../mutations/AddProposalSmsVoteMutation'
import DeleteProposalMutation from '../../mutations/DeleteProposalMutation'
import type { Exact, Dispatch, Uuid, Action } from '../../types'
import { isInterpellationContextFromStep, isInterpellationContextFromProposal } from '~/utils/interpellationLabelHelper'
export type ProposalViewMode = 'LIST' | 'GRID' | 'MAP'
export type Filters = {
  types: string | null | undefined
  categories: string | null | undefined
  statuses: string | null | undefined
  themes: string | null | undefined
  districts: string | null | undefined
  state: string | null | undefined
}
type Status = {
  name: string
  id: number
  color: string
}
type ChangeFilterAction = {
  type: 'proposal/CHANGE_FILTER'
  filter: string
  value: string
}
type ChangeOrderAction = {
  type: 'proposal/CHANGE_ORDER'
  order: string
}
type LoadSelectionsAction = {
  type: 'proposal/LOAD_SELECTIONS_REQUEST'
  proposalId: Uuid
}
type CloseCreateFusionModalAction = {
  type: 'proposal/CLOSE_CREATE_FUSION_MODAL'
}
type OpenCreateFusionModalAction = {
  type: 'proposal/OPEN_CREATE_FUSION_MODAL'
}
type CloseDeleteProposalModalAction = {
  type: 'proposal/CLOSE_DELETE_MODAL'
}
type OpenDeleteProposalModalAction = {
  type: 'proposal/OPEN_DELETE_MODAL'
}
type CloseCreateModalAction = {
  type: 'proposal/CLOSE_CREATE_MODAL'
}
type ChangePageAction = {
  type: 'proposal/CHANGE_PAGE'
  page: number
}
type ChangeTermAction = {
  type: 'proposal/CHANGE_TERMS'
  terms: string
}
type OpenVoteModalAction = {
  type: 'proposal/OPEN_VOTE_MODAL'
  id: Uuid
}
type CloseVoteModalAction = {
  type: 'proposal/CLOSE_VOTE_MODAL'
}
type RequestVotingAction = {
  type: 'proposal/VOTE_REQUESTED'
}
type VoteFailedAction = {
  type: 'proposal/VOTE_FAILED'
}
type OpenDetailLikersModalAction = {
  type: 'proposal/OPEN_DETAIL_LIKERS_MODAL'
  id: string
}
type CloseDetailLikersModalAction = {
  type: 'proposal/CLOSE_DETAIL_LIKERS_MODAL'
}
type Step = {
  type?: string
  statuses?: Array<Status>
  id: Uuid
}
type Selection = {
  step: Step
  status: Status | null | undefined
}
export type Proposal = {
  selections: Array<Selection>
  viewerCanSeeEvaluation: boolean
} & Record<string, any>
export type State = {
  readonly currentVoteModal: Uuid | null | undefined
  readonly currentDeletingVote: Uuid | null | undefined
  readonly showCreateModal: boolean
  readonly isCreatingFusion: boolean
  readonly showDeleteModal: boolean
  readonly isDeleting: boolean
  readonly isVoting: boolean
  readonly isLoading: boolean
  readonly isEditing: boolean
  readonly showEditModal: boolean
  readonly order: string | null | undefined
  readonly filters: Filters
  readonly terms: string | null | undefined
  readonly lastEditedStepId: Uuid | null | undefined
  readonly lastEditedProposalId: Uuid | null | undefined
  readonly lastNotifiedStepId: Uuid | null | undefined
  readonly referer: string | null | undefined
  readonly showDetailLikersModal: string | null | undefined
}
export const initialState: State = {
  lastEditedStepId: null,
  currentVoteModal: null,
  currentDeletingVote: null,
  showCreateModal: false,
  isCreatingFusion: false,
  showDeleteModal: false,
  isDeleting: false,
  isVoting: false,
  isLoading: true,
  isEditing: false,
  showEditModal: false,
  order: null,
  filters: {
    themes: null,
    categories: null,
    types: null,
    statuses: null,
    districts: null,
    state: null,
  },
  terms: null,
  lastEditedProposalId: null,
  lastNotifiedStepId: null,
  referer: null,
  showDetailLikersModal: null,
}
export const closeCreateFusionModal = (): CloseCreateFusionModalAction => ({
  type: 'proposal/CLOSE_CREATE_FUSION_MODAL',
})
export const openCreateFusionModal = (): OpenCreateFusionModalAction => ({
  type: 'proposal/OPEN_CREATE_FUSION_MODAL',
})
export const closeDeleteProposalModal = (): CloseDeleteProposalModalAction => ({
  type: 'proposal/CLOSE_DELETE_MODAL',
})
export const openDeleteProposalModal = (): OpenDeleteProposalModalAction => ({
  type: 'proposal/OPEN_DELETE_MODAL',
})
export const closeCreateModal = (): CloseCreateModalAction => ({
  type: 'proposal/CLOSE_CREATE_MODAL',
})
export const openVoteModal = (id: Uuid): OpenVoteModalAction => ({
  type: 'proposal/OPEN_VOTE_MODAL',
  id,
})
export const closeVoteModal = (): CloseVoteModalAction => ({
  type: 'proposal/CLOSE_VOTE_MODAL',
})
export const changePage = (page: number): ChangePageAction => ({
  type: 'proposal/CHANGE_PAGE',
  page,
})
export const changeOrder = (order: string): ChangeOrderAction => ({
  type: 'proposal/CHANGE_ORDER',
  order,
})
export const changeTerm = (terms: string): ChangeTermAction => ({
  type: 'proposal/CHANGE_TERMS',
  terms,
})
export const changeFilter = (filter: string, value: string): ChangeFilterAction => ({
  type: 'proposal/CHANGE_FILTER',
  filter,
  value,
})
export const openDetailLikersModal = (id: string): OpenDetailLikersModalAction => ({
  type: 'proposal/OPEN_DETAIL_LIKERS_MODAL',
  id,
})
export const closeDetailLikersModal = (): CloseDetailLikersModalAction => ({
  type: 'proposal/CLOSE_DETAIL_LIKERS_MODAL',
})
type RequestDeleteAction = {
  type: 'proposal/DELETE_REQUEST'
}

const deleteRequest = (): RequestDeleteAction => ({
  type: 'proposal/DELETE_REQUEST',
})

export const deleteProposal = (proposalId: string, dispatch: Dispatch, intl: IntlShape): void => {
  dispatch(deleteRequest())
  DeleteProposalMutation.commit({
    input: {
      proposalId,
    },
  })
    .then(response => {
      dispatch(closeDeleteProposalModal())

      if (response.deleteProposal) {
        window.location.href = response.deleteProposal.step.url
      }
      oldToast({
        content: intl.formatMessage({
          id:
            response.deleteProposal &&
            response.deleteProposal.proposal &&
            isInterpellationContextFromProposal(response.deleteProposal.proposal)
              ? 'interpellation.request.delete.success'
              : 'proposal.request.delete.success',
        }),
        variant: 'success',
      })
    })
    .catch(() => {
      oldToast({ content: intl.formatMessage({ id: 'global.failure' }), variant: 'warning' })
    })
}
export const startVoting = (): RequestVotingAction => ({
  type: 'proposal/VOTE_REQUESTED',
})
export const stopVoting = (): VoteFailedAction => ({
  type: 'proposal/VOTE_FAILED',
})
export const vote = (
  dispatch: Dispatch,
  stepId: Uuid,
  proposalId: Uuid,
  anonymously: boolean,
  intl: IntlShape,
  isAuthenticated: boolean,
  token?: string,
  onSuccess?: () => void,
  onError?: () => void,
) => {
  if (isAuthenticated) {
    dispatch(startVoting())
    return AddProposalVoteMutation
      .commit({
        stepId,
        input: {
          proposalId,
          stepId,
          anonymously,
        },
      })
      .then(response => {
        const errorCode = response?.addProposalVote?.errorCode;

        if (errorCode === 'PHONE_ALREADY_USED') {
          toast({
            variant: 'danger',
            content: intl.formatMessage({ id: 'phone.already.used.in.this.step' }),
          })
          dispatch(closeVoteModal())
          return;
        }

        dispatch(closeVoteModal())
        const isInterpellation =
          response.addProposalVote?.voteEdge &&
          isInterpellationContextFromStep(response.addProposalVote.voteEdge.node.step)
        const successTranslationKey =
          response.addProposalVote && response.addProposalVote.voteEdge && isInterpellation
            ? 'support.add_success'
            : 'vote.add_success'
        if (isInterpellation)
          toast({
            variant: 'success',
            content: intl.formatMessage({
              id: successTranslationKey,
            }),
          })
        if (onSuccess) onSuccess()
        return response
      })
      .catch(e => {
        if (onError) onError()
        console.log(e) // eslint-disable-line no-console
        dispatch(closeVoteModal())
        toast({ content: intl.formatMessage({ id: 'global.failure' }), variant: 'danger' })
      })
  } else {
    dispatch(startVoting())
    const consentSmsCommunication = localStorage.getItem('consentSmsCommunication') ?? false
    return AddProposalSmsVoteMutation
      .commit({
        stepId,
        input: {
          proposalId,
          stepId,
          token,
          consentSmsCommunication
        },
        token: token ?? ''
      })
      .then(response => {

        const errorCode = response?.addProposalSmsVote?.errorCode;

        if (errorCode === 'PHONE_ALREADY_USED') {
          toast({
            variant: 'danger',
            content: intl.formatMessage({ id: 'phone.already.used.in.this.step' }),
          })
          dispatch(closeVoteModal())
          return;
        }


        dispatch(closeVoteModal())
        const isInterpellation =
          response.addProposalSmsVote?.voteEdge &&
          isInterpellationContextFromStep(response.addProposalSmsVote.voteEdge.node.step)
        const successTranslationKey =
          response.addProposalSmsVote && response.addProposalSmsVote.voteEdge && isInterpellation
            ? 'support.add_success'
            : 'vote.add_success'
        if (isInterpellation)
          toast({
            variant: 'success',
            content: intl.formatMessage({
              id: successTranslationKey,
            }),
          })
        if (onSuccess) onSuccess()
        return response
      })
      .catch(e => {
        if (onError) onError()
        console.log(e) // eslint-disable-line no-console

        dispatch(closeVoteModal())
        toast({ content: intl.formatMessage({ id: 'global.failure' }), variant: 'danger' })
      })
  }
}
export type ProposalAction =
  | ChangeFilterAction
  | VoteFailedAction
  | RequestVotingAction
  | ChangeTermAction
  | ChangeOrderAction
  | ChangePageAction
  | CloseCreateModalAction
  | OpenVoteModalAction
  | OpenDeleteProposalModalAction
  | LoadSelectionsAction
  | CloseVoteModalAction
  | CloseDeleteProposalModalAction
  | RequestDeleteAction
  | OpenCreateFusionModalAction
  | CloseCreateFusionModalAction
  | OpenDetailLikersModalAction
  | CloseDetailLikersModalAction
  | {
  type: 'proposal/POSTS_FETCH_FAILED'
  error: Error
}
  | {
  type: 'proposal/FETCH_SUCCEEDED'
  proposals: Array<Record<string, any>>
  count: number
}
  | {
  type: 'proposal/POSTS_FETCH_SUCCEEDED'
  posts: Array<Record<string, any>>
  proposalId: Uuid
}
export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case 'proposal/CHANGE_FILTER': {
      const filters = { ...state.filters, [action.filter]: action.value }
      return { ...state, filters }
    }

    case 'proposal/OPEN_CREATE_FUSION_MODAL':
      return { ...state, isCreatingFusion: true }

    case 'proposal/CLOSE_CREATE_FUSION_MODAL':
      return { ...state, isCreatingFusion: false }

    case 'proposal/CHANGE_ORDER':
      return { ...state, order: action.order }

    case 'proposal/CHANGE_TERMS':
      return { ...state, terms: action.terms }

    case 'proposal/OPEN_EDIT_MODAL':
      return { ...state, showEditModal: true }

    case 'proposal/CLOSE_EDIT_MODAL':
      return { ...state, showEditModal: false, isEditing: false }

    case 'proposal/OPEN_DELETE_MODAL':
      return { ...state, showDeleteModal: true }

    case 'proposal/CLOSE_DELETE_MODAL':
      return { ...state, showDeleteModal: false, isDeleting: false }

    case 'proposal/OPEN_CREATE_MODAL':
      return { ...state, showCreateModal: true }

    case 'proposal/CLOSE_CREATE_MODAL':
      return { ...state, showCreateModal: false }

    case 'proposal/OPEN_VOTE_MODAL':
      return { ...state, currentVoteModal: action.id }

    case 'proposal/CLOSE_VOTE_MODAL':
      return { ...state, currentVoteModal: null, isVoting: false }

    case 'proposal/VOTE_REQUESTED':
      return { ...state, isVoting: true }

    case 'proposal/VOTE_FAILED':
      return { ...state, isVoting: false }

    case 'proposal/DELETE_REQUEST':
      return { ...state, isDeleting: true }

    case 'proposal/OPEN_DETAIL_LIKERS_MODAL':
      return { ...state, showDetailLikersModal: action.id }

    case 'proposal/CLOSE_DETAIL_LIKERS_MODAL':
      return { ...state, showDetailLikersModal: null }

    default:
      return state
  }
}