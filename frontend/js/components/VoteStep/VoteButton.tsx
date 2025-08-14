import * as React from 'react'
import { useIntl } from 'react-intl'
import { toast } from '@cap-collectif/ui'
import { useDispatch, useSelector } from 'react-redux'
import type { GlobalState } from '~/types'
import RemoveProposalVoteMutation from '~/mutations/RemoveProposalVoteMutation'
import { vote } from '~/redux/modules/proposal'
import { VoteStepEvent, dispatchEvent, View } from './utils'
import { graphql, useFragment } from 'react-relay'
import ProposalPreviewVote from '../Proposal/Preview/ProposalPreviewVote'
import type { VoteButton_proposal$key } from '~relay/VoteButton_proposal.graphql'
import type { VoteButton_viewer$key } from '~relay/VoteButton_viewer.graphql'
import type { VoteButton_step$key } from '~relay/VoteButton_step.graphql'
import VoteButtonUI from './VoteButtonUI'
import { hasReachedLimit, userHasEnoughCredits } from '../Proposal/Vote/ProposalVoteButtonWrapperFragment'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import invariant from '~/utils/invariant'
import UpdateProposalVotesMutation from '~/mutations/UpdateProposalVotesMutation'
import { AddProposalVoteMutation$data } from '~relay/AddProposalVoteMutation.graphql'
import { useVoteStepContext } from './Context/VoteStepContext'
import ResetCss from '~/utils/ResetCss'
import { VoteButton_participant$key } from '~relay/VoteButton_participant.graphql'
import CookieMonster from '@shared/utils/CookieMonster'

type Props = {
  proposalId: string
  stepId: string
  disabled: boolean
  proposal: VoteButton_proposal$key | null | undefined
  viewer: VoteButton_viewer$key | null | undefined
  participant: VoteButton_participant$key | null | undefined
  step: VoteButton_step$key | null | undefined
}

const FRAGMENT = graphql`
  fragment VoteButton_proposal on Proposal
  @argumentDefinitions(stepId: { type: "ID!" }, isAuthenticated: { type: "Boolean!" }, token: { type: "String" }) {
    id
    estimation
    ...ProposalPreviewVote_proposal @arguments(isAuthenticated: $isAuthenticated, stepId: $stepId, token: $token)
    title
    ...ProposalVoteModal_proposal
    viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
    paperVotesTotalCount(stepId: $stepId)
    votes(stepId: $stepId, first: 0) {
      totalCount
    }
    currentVotableStep {
      id
    }
    isArchived
    form {
      objectType
    }
  }
`

const FRAGMENT_STEP = graphql`
  fragment VoteButton_step on Step
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, token: { type: "String" }) {
    ...ProposalPreviewVote_step @arguments(isAuthenticated: $isAuthenticated, token: $token)
    ...ProposalVoteModal_step @arguments(token: $token)
    ... on ProposalStep {
      open
      project {
        slug
      }
      votesLimit
      votesMin
      votesRanking
      budget
      viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
        totalCount
        edges {
          node {
            proposal {
              id
            }
          }
        }
      }
    }
    id
    ... on RequirementStep {
      requirements {
        edges {
          node {
            __typename
            viewerMeetsTheRequirement @include(if: $isAuthenticated)
          }
        }
      }
    }
  }
`

const FRAGMENT_VIEWER = graphql`
  fragment VoteButton_viewer on User @argumentDefinitions(stepId: { type: "ID!" }) {
    ...ProposalPreviewVote_viewer @arguments(stepId: $stepId)
    proposalVotes(stepId: $stepId) @include(if: $isAuthenticated) {
      totalCount
      creditsLeft
    }
  }
`

const PARTICIPANT_FRAGMENT = graphql`
  fragment VoteButton_participant on Participant @argumentDefinitions(stepId: { type: "ID!" }) {
    ...ProposalPreviewVote_participant @arguments(stepId: $stepId)
    proposalVotes(stepId: $stepId) {
      totalCount
      creditsLeft
    }
  }
`

const VoteButton = ({
  proposalId,
  stepId,
  disabled,
  proposal: proposalFragment,
  viewer: viewerFragment,
  step: stepFragment,
  participant: participantFragment,
}: Props) => {
  const isAuthenticated = useSelector((state: GlobalState) => state.user.user) !== null
  const dispatch = useDispatch()
  const proposal = useFragment(FRAGMENT, proposalFragment)
  const viewer = useFragment(FRAGMENT_VIEWER, viewerFragment)
  const step = useFragment(FRAGMENT_STEP, stepFragment)
  const participant = useFragment(PARTICIPANT_FRAGMENT, participantFragment)
  const [isLoading, setIsLoading] = React.useState(false)
  const isVoteMin = useFeatureFlag('votes_min')
  const { isParticipationAnonymous, setView } = useVoteStepContext()
  const intl = useIntl()
  const votesMin: number = isVoteMin && step.votesMin ? step.votesMin : 1
  const viewerVotesBeforeValidation = step?.viewerVotes?.totalCount || 0
  const remainingVotesAfterValidation = votesMin - viewerVotesBeforeValidation - 1
  const hasFinished = remainingVotesAfterValidation < 0
  const hasJustFinished = remainingVotesAfterValidation === 0
  const token = CookieMonster.getParticipantCookie();

  const { paperVotesTotalCount, votes } = proposal

  const totalCount = votes.totalCount + paperVotesTotalCount

  const hasVoted = proposal?.viewerHasVote
      ? proposal.viewerHasVote
      : step?.viewerVotes?.edges?.some(edge => edge?.node?.proposal?.id === proposal.id) ?? false

  const deleteVote = () => {
    setIsLoading(true)
    dispatchEvent(VoteStepEvent.AnimateCard, {
      proposalId,
    })
    return RemoveProposalVoteMutation.commit({
      stepId,
      input: {
        proposalId,
        stepId,
      },
      isAuthenticated,
      token: null,
    })
      .then(() => {
        dispatchEvent(VoteStepEvent.RemoveVote, {
          proposalId,
        })
        setIsLoading(false)
        toast({
          variant: 'success',
          content: intl.formatMessage({
            id: 'vote.delete_success',
          })
        })
      })
      .catch(() => {
        setIsLoading(false)
        toast({
          variant: 'warning',
          content: intl.formatMessage({
            id: 'global.failure',
          }),
        })
      })
  }

  const onButtonClick = () => {
    if (hasVoted) {
      deleteVote()
    }
    else {
      setIsLoading(true)
      vote(
        dispatch,
        stepId,
        proposalId,
        isParticipationAnonymous,
        intl,
        isAuthenticated,
        token,
        () => {
          setIsLoading(false)
          if (votesMin > 1 && (!hasFinished || hasJustFinished)) {
            toast({
              variant: hasJustFinished ? 'success' : 'warning',
              content: intl.formatMessage(
                {
                  id: hasJustFinished ? (isAuthenticated ? 'participation-validated' :  'participation-validated-anonymous') : 'vote-for-x-proposals',
                },
                {
                  num: remainingVotesAfterValidation,
                  div: (...chunks) => <div>{chunks}</div>,
                  b: (...chunks) => <b>{chunks}</b>,
                  a: (...chunks) => (
                    <span
                      style={{
                        marginLeft: 4,
                      }}
                    >
                      <ResetCss>
                        <button style={{ textDecoration: 'underline' }} onClick={() => setView(View.Votes)}>
                          {chunks}
                        </button>
                      </ResetCss>
                    </span>
                  ),
                },
              ),
            })
          } else {
            toast({
              variant: 'success',
              content: intl.formatMessage({
                id: 'vote.add_success',
              }),
            })
            setIsLoading(false)
          }
        },
        () => setIsLoading(false),
      ).then((data: AddProposalVoteMutation$data) => {
        const votes = data?.addProposalVote.voteEdge.node.step.viewerVotes.edges.map(({ node }) => node)
        if (!data?.addProposalVote?.voteEdge?.node || typeof data.addProposalVote.voteEdge === 'undefined') {
          invariant(false, 'The vote id is missing.')
        }

        if (!step.votesRanking) {
          return
        }

        // Otherwise we update/reorder votes
        return UpdateProposalVotesMutation.commit(
          {
            input: {
              step: stepId,
              votes: votes
                .filter(voteFilter => voteFilter.id !== null)
                .map(v => ({
                  id: v.id,
                  anonymous: v.anonymous,
                })),
            },
            stepId,
            isAuthenticated,
            token: null,
          },
          {
            id: null,
            position: -1,
            isVoteRanking: step.votesRanking,
          },
        )
      })
    }
  }

  const showVoteButton =
    step &&
    proposal.currentVotableStep &&
    step.id === proposal.currentVotableStep.id &&
    !proposal.isArchived

  if (!showVoteButton) {
    return null
  }

  const requirements = step.requirements?.edges?.filter(e => !!e?.node).map(edge => edge.node) || []
  const allRequirementsMet = requirements?.every(requirement => requirement.viewerMeetsTheRequirement)
  const viewerVotesCount = viewer?.proposalVotes ? viewer?.proposalVotes.totalCount : 0

  return (
    <>
      {
        /**
         * Dans les cas suivants : vote anonyme (SMS), vote max atteint, conditions requises non remplies,
         * On part sur l'ouverture de la modale ou du popup, à l'ancienne
         */
        !isAuthenticated ||
        !allRequirementsMet ||
        hasReachedLimit(isAuthenticated, step?.votesLimit, hasVoted, viewerVotesCount, step?.viewerVotes?.totalCount) ||
        (!userHasEnoughCredits(
          !viewer || !viewer?.proposalVotes,
          proposal.estimation,
          viewer?.proposalVotes?.creditsLeft,
        ) &&
          step.budget) ? (
          <ProposalPreviewVote
            step={step}
            viewer={viewer}
            proposal={proposal}
            usesNewUI
            disabled={disabled || isLoading}
            participant={participant}
          />
        ) : (
          <VoteButtonUI
            id={`proposal-vote-btn-${proposalId}`}
            onClick={onButtonClick}
            disabled={disabled || isLoading}
            totalCount={totalCount}
            paperVotesTotalCount={paperVotesTotalCount}
            hasVoted={hasVoted}
            title={proposal.title}
          />
        )
      }
    </>
  )
}

export default VoteButton
