import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import { Button } from 'react-bootstrap'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import type { IntlShape } from 'react-intl'
import { openVoteModal } from '~/redux/modules/proposal'
import type {
  ProposalVoteButton_proposal$key,
  ProposalVoteButton_proposal$data,
} from '~relay/ProposalVoteButton_proposal.graphql'
import RemoveProposalVoteMutation from '../../../mutations/RemoveProposalVoteMutation'
import RemoveProposalSmsVoteMutation from '../../../mutations/RemoveProposalSmsVoteMutation'
import { isInterpellationContextFromStep, isInterpellationContextFromProposal } from '~/utils/interpellationLabelHelper'
import { toast } from '@cap-collectif/ui'
import type { ProposalVoteButton_step$key, ProposalVoteButton_step$data } from '~relay/ProposalVoteButton_step.graphql'
// TODO @Mo remake this file with @cap-collectif/ui to replace tooltip that already doesn't work
import CookieMonster from '@shared/utils/CookieMonster'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import AddProposalSmsVoteMutation from '~/mutations/AddProposalSmsVoteMutation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import type { AddProposalSmsVoteMutation$data } from '~relay/AddProposalSmsVoteMutation.graphql'
import { VoteStepEvent, dispatchEvent } from '~/components/VoteStep/utils'
import VoteButtonUI from '~/components/VoteStep/VoteButtonUI'
import { State } from '~/types'

type ParentProps = {
  proposal: ProposalVoteButton_proposal$key
  currentStep: ProposalVoteButton_step$key | null | undefined
  isHovering?: boolean
  id: string
  className?: string
  usesNewUI?: boolean
}
type Props = ParentProps & {
  disabled: boolean
  hasVoted: boolean
}
const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalVoteButton_proposal on Proposal
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, stepId: { type: "ID!" }) {
    id
    ...interpellationLabelHelper_proposal @relay(mask: false)
    viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
    paper: paperVotesTotalCount(stepId: $stepId)
    viewerVote(step: $stepId) @include(if: $isAuthenticated) {
      id
      ranking
      ...UnpublishedTooltip_publishable
    }
    votes(stepId: $stepId, first: 0) {
      totalCount
    }
  }
`
const STEP_FRAGMENT = graphql`
  fragment ProposalVoteButton_step on ProposalStep {
    id
    votesRanking
    isProposalSmsVoteEnabled
  }
`

const deleteVote = (
  currentStep: ProposalVoteButton_step$data,
  proposal: ProposalVoteButton_proposal$data,
  isAuthenticated: boolean,
  intl: IntlShape,
) => {
  dispatchEvent(VoteStepEvent.AnimateCard, {
    proposalId: proposal.id,
  })
  if (isAuthenticated) {
    return RemoveProposalVoteMutation.commit({
      stepId: currentStep.id,
      input: {
        proposalId: proposal.id,
        stepId: currentStep.id,
      },
      isAuthenticated,
      token: null,
    })
      .then(response => {
        dispatchEvent(VoteStepEvent.RemoveVote, {
          proposalId: proposal.id,
        })
        toast({
          variant: 'success',
          content:
            response.removeProposalVote &&
            response.removeProposalVote.step &&
            isInterpellationContextFromStep(response.removeProposalVote.step)
              ? intl.formatMessage({
                  id: 'support.delete_success',
                })
              : intl.formatMessage({
                  id: 'vote.delete_success',
                }),
        })
      })
      .catch(() => {
        toast({
          variant: 'warning',
          content: intl.formatMessage({
            id: 'global.failure',
          }),
        })
      })
  }

  const token = CookieMonster.getAnonymousAuthenticatedWithConfirmedPhone()
  return RemoveProposalSmsVoteMutation.commit({
    input: {
      proposalId: proposal.id,
      stepId: currentStep.id,
      token: token ?? '',
    },
    isAuthenticated,
    token,
  })
    .then(response => {
      const errorCode = response?.removeProposalSmsVote?.errorCode

      if (errorCode === 'PHONE_NOT_FOUND') {
        return toast({
          variant: 'warning',
          content: intl.formatMessage({
            id: 'cant-delete-vote',
          }),
        })
      }
      dispatchEvent(VoteStepEvent.RemoveVote, {
        proposalId: proposal.id,
      })
      toast({
        variant: 'success',
        content:
          response.removeProposalSmsVote &&
          response.removeProposalSmsVote.step &&
          isInterpellationContextFromStep(response.removeProposalSmsVote.step)
            ? intl.formatMessage({
                id: 'support.delete_success',
              })
            : intl.formatMessage({
                id: 'vote.delete_success',
              }),
      })
    })
    .catch(() => {
      toast({
        variant: 'warning',
        content: intl.formatMessage({
          id: 'global.failure',
        }),
      })
    })
}

const addProposalSmsVote = async (intl: IntlShape, token: string, proposalId: string, stepId: string) => {
  try {
    const response: AddProposalSmsVoteMutation$data = await AddProposalSmsVoteMutation.commit({
      input: {
        token,
        proposalId,
        stepId,
        consentSmsCommunication: false,
      },
      token,
    })
    if (!response?.addProposalSmsVote) return mutationErrorToast(intl)
    const errorCode = response?.addProposalSmsVote?.errorCode

    if (errorCode === 'PROPOSAL_ALREADY_VOTED') {
      return toast({
        variant: 'danger',
        content: intl.formatMessage({
          id: 'rejected-vote-choose-another-one',
        }),
      })
    }

    if (errorCode === 'VOTE_LIMIT_REACHED') {
      return toast({
        variant: 'danger',
        content: intl.formatMessage({
          id: 'you-reached-max-votes',
        }),
      })
    }

    return toast({
      variant: 'success',
      content: intl.formatMessage({
        id: 'your-vote-has-been-validated',
      }),
    })
  } catch (e) {
    return mutationErrorToast(intl)
  }
}

const ProposalVoteButton = ({
  currentStep: stepRef,
  isHovering = false,
  id,
  proposal: proposalRef,
  disabled = false,
  hasVoted,
  usesNewUI,
}: Props) => {
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef)
  const currentStep = useFragment(STEP_FRAGMENT, stepRef)
  const isAuthenticated = useSelector<State>(state => state.user.user) != null
  const isDeleting = useSelector<State>(state => state.proposal.currentDeletingVote) === proposal.id
  const dispatch = useDispatch()
  const isTwilioFeatureEnabled = useFeatureFlag('twilio')
  const isProposalSmsVoteFeatureEnabled = useFeatureFlag('proposal_sms_vote')
  const smsVoteEnabled =
    currentStep?.isProposalSmsVoteEnabled && isTwilioFeatureEnabled && isProposalSmsVoteFeatureEnabled
  const token = CookieMonster.getAnonymousAuthenticatedWithConfirmedPhone()
  const canVoteAnonymouslyWithoutConfirmingPhoneNumber = !!token && smsVoteEnabled && !isAuthenticated

  const getButtonStyle = () => {
    if (hasVoted && isHovering) {
      return 'btn btn-danger'
    }

    return 'btn btn-success'
  }

  const intl = useIntl()

  const getButtonText = () => {
    const isInterpellation = isInterpellationContextFromProposal(proposal)

    if (hasVoted) {
      if (isInterpellation) {
        return isHovering ? 'cancel' : 'interpellation.support.supported'
      }

      return isHovering ? 'cancel' : 'voted'
    }

    if (isInterpellation) {
      return 'global.support.for'
    }

    return 'global.vote.for'
  }

  const classes = classNames({
    disabled,
  })

  const onButtonClick = () => {
    if (disabled) return null

    if (hasVoted && currentStep) {
      deleteVote(currentStep, proposal, isAuthenticated, intl)
      return
    }

    if (canVoteAnonymouslyWithoutConfirmingPhoneNumber && token && proposal && currentStep) {
      addProposalSmsVote(intl, token, proposal.id, currentStep.id)
      return
    }

    dispatch(openVoteModal(proposal.id))
  }

  if (usesNewUI)
    return (
      <VoteButtonUI
        id={`proposal-vote-btn-${proposal.id}`}
        onClick={onButtonClick}
        disabled={isDeleting || disabled}
        totalCount={proposal?.votes?.totalCount}
        paperVotesTotalCount={proposal?.paper}
        hasVoted={hasVoted}
        noOverlay
      />
    )

  return (
    <Button
      id={id}
      className={`mr-10 proposal__button__vote ${getButtonStyle()} ${classes} `}
      onClick={onButtonClick}
      active={hasVoted}
      disabled={isDeleting}
    >
      <i className="cap cap-hand-like-2 mr-5" />
      {intl.formatMessage({
        id: getButtonText(),
      })}
    </Button>
  )
}

export default ProposalVoteButton
