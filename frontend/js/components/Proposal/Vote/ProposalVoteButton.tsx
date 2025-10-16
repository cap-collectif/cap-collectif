import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
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
import { CapUIModalSize, Modal, toast } from '@cap-collectif/ui'
import type { ProposalVoteButton_step$key, ProposalVoteButton_step$data } from '~relay/ProposalVoteButton_step.graphql'
// TODO @Mo remake this file with @cap-collectif/ui to replace tooltip that already doesn't work
import CookieMonster from '@shared/utils/CookieMonster'
import AddProposalSmsVoteMutation from '~/mutations/AddProposalSmsVoteMutation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import { VoteStepEvent, dispatchEvent } from '~/components/VoteStep/utils'
import VoteButtonUI from '~/components/VoteStep/VoteButtonUI'
import { State } from '~/types'
import AddProposalVoteMutation from '~/mutations/AddProposalVoteMutation'
import { Popover, Button, Flex, Text, CapUIFontWeight, VoteButton as DSVoteButton } from '@cap-collectif/ui'
import Captcha from '~/components/Form/Captcha'
import useIsMobile from '@shared/hooks/useIsMobile'

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
  triggerRequirementsModal: (voteId: string) => void
}
const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalVoteButton_proposal on Proposal
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, stepId: { type: "ID!" }, token: { type: "String" }) {
    id
    title
    ...interpellationLabelHelper_proposal @relay(mask: false)
    viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
    paper: paperVotesTotalCount(stepId: $stepId)
    viewerVote(step: $stepId) @include(if: $isAuthenticated) {
      id
      ranking
      completionStatus
      ...UnpublishedTooltip_publishable
    }
    contributorVote(step: $stepId, token: $token) {
      id
      completionStatus
    }
    votes(stepId: $stepId, first: 0) {
      totalCount
    }
  }
`
const STEP_FRAGMENT = graphql`
  fragment ProposalVoteButton_step on ProposalStep
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, token: { type: "String" }) {
    id
    votesRanking
    votesMin
    votesLimit
    viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
      totalCount
    }
    requirements {
      viewerMeetsTheRequirements @include(if: $isAuthenticated)
      participantMeetsTheRequirements(token: $token)
      edges {
        node {
          __typename
        }
      }
    }
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

  const token = CookieMonster.getParticipantCookie()
  return RemoveProposalSmsVoteMutation.commit({
    input: {
      proposalId: proposal.id,
      stepId: currentStep.id,
      token: token ?? '',
    },
    token,
    stepId: currentStep.id,
  })
    .then(response => {
      const errorCode = response?.removeProposalSmsVote?.errorCode

      if (errorCode === 'PARTICIPANT_NOT_FOUND') {
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
const ProposalVoteButton = ({
  currentStep: stepRef,
  isHovering = false,
  id,
  proposal: proposalRef,
  disabled = false,
  hasVoted,
  usesNewUI,
  triggerRequirementsModal,
}: Props) => {
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef)
  const currentStep = useFragment(STEP_FRAGMENT, stepRef)
  const isAuthenticated = useSelector<State>(state => state.user.user) != null
  const isDeleting = useSelector<State>(state => state.proposal.currentDeletingVote) === proposal.id
  const dispatch = useDispatch()
  const isMeetingRequirements = isAuthenticated
    ? currentStep.requirements.viewerMeetsTheRequirements
    : currentStep.requirements.participantMeetsTheRequirements
  const [isLoading, setIsLoading] = React.useState(false)

  const isMobile = useIsMobile()

  const hasFilledCaptcha = JSON.parse(localStorage.getItem('hasFilledCaptcha'))
  const setHasFilledCaptcha = () => {
    localStorage.setItem('hasFilledCaptcha', JSON.stringify(true))
  }

  const { votesMin } = currentStep
  const participantToken = CookieMonster.getParticipantCookie()

  const vote = isAuthenticated ? proposal.viewerVote : proposal.contributorVote

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

  const onButtonClick = async () => {
    if (disabled) return null

    if (hasVoted && currentStep) {
      setIsLoading(true)
      await deleteVote(currentStep, proposal, isAuthenticated, intl)
      setIsLoading(false)
      return
    }

    if (!hasVoted && vote?.completionStatus === 'MISSING_REQUIREMENTS') {
      triggerRequirementsModal(vote.id)
      return
    }

    if (
      !usesNewUI &&
      ((votesMin && votesMin > 1) || (currentStep?.votesRanking && currentStep.viewerVotes.totalCount > 0))
    ) {
      dispatch(openVoteModal(proposal.id))
      return
    }

    if (isAuthenticated) {
      try {
        setIsLoading(true)
        const response = await AddProposalVoteMutation.commit({
          stepId: currentStep.id,
          input: {
            proposalId: proposal.id,
            stepId: currentStep.id,
            anonymously: true,
          },
        })

        setIsLoading(false)

        const errorCode = response?.addProposalVote?.errorCode

        if (errorCode === 'PHONE_ALREADY_USED') {
          toast({
            variant: 'danger',
            content: intl.formatMessage({ id: 'phone.already.used.in.this.step' }),
          })
          return
        }

        const newVote = response.addProposalVote.voteEdge.node
        const updatedVotesCount = response.addProposalVote.voteEdge.node.step.viewerVotes.totalCount

        let hasReachedVotesMin = true
        if (votesMin && votesMin > 1) {
          hasReachedVotesMin = votesMin === updatedVotesCount
        }

        const { shouldTriggerConsentInternalCommunication } = response.addProposalVote

        if ((!isMeetingRequirements || shouldTriggerConsentInternalCommunication) && hasReachedVotesMin) {
          triggerRequirementsModal(newVote.id)
          return
        }

        if (response && hasReachedVotesMin) {
          toast({
            variant: 'success',
            content: intl.formatMessage({
              id: 'vote.add_success',
            }),
          })
        }
        return
      } catch (error) {
        return mutationErrorToast(intl)
      }
    } else {
      setIsLoading(true)
      const response = await AddProposalSmsVoteMutation.commit({
        token: participantToken ?? '',
        stepId: currentStep.id,
        input: {
          proposalId: proposal.id,
          stepId: currentStep.id,
          token: participantToken,
        },
      })
      setIsLoading(false)

      const errorCode = response?.addProposalSmsVote?.errorCode

      if (errorCode === 'PHONE_ALREADY_USED') {
        toast({
          variant: 'danger',
          content: intl.formatMessage({ id: 'phone.already.used.in.this.step' }),
        })
        return
      }

      if (!participantToken) {
        const newParticipantToken = response.addProposalSmsVote.participantToken
        CookieMonster.addParticipantCookie(newParticipantToken)
        dispatchEvent(VoteStepEvent.NewParticipantToken, {
          token: newParticipantToken,
        })
      }

      const newVote = response.addProposalSmsVote.voteEdge.node
      let updatedVotesCount = newVote.step.viewerVotes.totalCount || 1

      if (newVote.completionStatus === 'MISSING_REQUIREMENTS') {
        updatedVotesCount += 1
      }

      let hasReachedVotesMin = true
      if (votesMin && votesMin > 1) {
        hasReachedVotesMin = votesMin === updatedVotesCount
      }

      const { shouldTriggerConsentInternalCommunication } = response.addProposalSmsVote

      if ((!isMeetingRequirements || shouldTriggerConsentInternalCommunication) && hasReachedVotesMin) {
        triggerRequirementsModal(newVote.id)
        return
      }

      if (response && hasReachedVotesMin) {
        toast({
          variant: 'success',
          content: intl.formatMessage({
            id: 'vote.add_success',
          }),
        })
      }
    }
  }

  if (!isAuthenticated && isMeetingRequirements && !hasVoted && !hasFilledCaptcha) {
    if (isMobile) {
      return (
        <Modal
          disclosure={
            usesNewUI ? (
              <DSVoteButton
                active={hasVoted}
                id={id}
                onClick={() => {}}
                disabled={disabled}
                aria-label={intl.formatMessage({ id: hasVoted ? 'delete-vote' : 'vote.add' })}
              >
                <Flex direction="column" align="flex-start">
                  <Text fontWeight={CapUIFontWeight.Semibold}>{proposal?.votes?.totalCount}</Text>
                </Flex>
              </DSVoteButton>
            ) : (
              <Button
                className={`mr-10 proposal__button__vote ${getButtonStyle()} ${classes} `}
                fontWeight="400"
                id={id}
              >
                <i className="cap cap-hand-like-2 mr-5" />
                {intl.formatMessage({
                  id: getButtonText(),
                })}
              </Button>
            )
          }
          ariaLabel={intl.formatMessage({ id: 'captcha-verification' })}
          size={CapUIModalSize.Md}
        >
          <Modal.Header>
            <Modal.Header.Label>
              {intl.formatMessage({ id: 'captcha-verification' })}{' '}
              <span role="img" aria-label="robot">
                🤖
              </span>
            </Modal.Header.Label>
          </Modal.Header>
          <Modal.Body>
            <Flex justifyContent="center">
              <Captcha
                onChange={async (value: any) => {
                  if (!value) return
                  setHasFilledCaptcha()
                  await onButtonClick()
                }}
              />
            </Flex>
          </Modal.Body>
        </Modal>
      )
    }

    return (
      <Popover
        id="popover-positioned-right"
        placement={isMobile ? 'bottom' : 'right'}
        disclosure={
          usesNewUI ? (
            <DSVoteButton
              active={hasVoted}
              id={id}
              onClick={() => {}}
              disabled={disabled}
              aria-label={intl.formatMessage({ id: hasVoted ? 'delete-vote' : 'vote.add' })}
            >
              <Flex direction="column" align="flex-start">
                <Text fontWeight={CapUIFontWeight.Semibold}>{proposal?.votes?.totalCount}</Text>
              </Flex>
            </DSVoteButton>
          ) : (
            <Button className={`mr-10 proposal__button__vote ${getButtonStyle()} ${classes} `} fontWeight="400" id={id}>
              <i className="cap cap-hand-like-2 mr-5" />
              {intl.formatMessage({
                id: getButtonText(),
              })}
            </Button>
          )
        }
      >
        <Popover.Header>
          {intl.formatMessage({ id: 'captcha-verification' })}{' '}
          <span role="img" aria-label="robot">
            🤖
          </span>
        </Popover.Header>
        <Popover.Body>
          <Captcha
            onChange={async (value: any) => {
              if (!value) return
              setHasFilledCaptcha()
              await onButtonClick()
            }}
          />
        </Popover.Body>
      </Popover>
    )
  }

  if (usesNewUI)
    return (
      <VoteButtonUI
        id={`proposal-vote-btn-${proposal.id}`}
        onClick={onButtonClick}
        disabled={isDeleting || disabled || isLoading}
        totalCount={proposal?.votes?.totalCount}
        paperVotesTotalCount={proposal?.paper}
        hasVoted={hasVoted}
        noOverlay
        title={proposal.title}
      />
    )

  return (
    <Button
      id={id}
      className={`mr-10 proposal__button__vote ${getButtonStyle()} ${classes} `}
      onClick={onButtonClick}
      active={hasVoted}
      disabled={isDeleting}
      fontWeight="400"
    >
      <i className="cap cap-hand-like-2 mr-5" />
      {intl.formatMessage({
        id: getButtonText(),
      })}
    </Button>
  )
}

export default ProposalVoteButton
