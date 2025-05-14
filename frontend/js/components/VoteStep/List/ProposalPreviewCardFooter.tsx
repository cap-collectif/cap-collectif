import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { Box, Flex, Icon, CapUIIconSize, Proposal, CapUIIcon, BoxProps, CapUIFontSize } from '@cap-collectif/ui'
import type { ProposalPreviewCardFooter_proposal$key } from '~relay/ProposalPreviewCardFooter_proposal.graphql'
import type { ProposalPreviewCardFooter_viewer$key } from '~relay/ProposalPreviewCardFooter_viewer.graphql'
import type { ProposalPreviewCardFooter_step$key } from '~relay/ProposalPreviewCardFooter_step.graphql'
import useIsMobile from '~/utils/hooks/useIsMobile'
import VoteButton from '../VoteButton'
import { View } from '../utils'
import { formatBigNumber } from '~/utils/bigNumberFormatter'
import ProposalPreviewCardRankVoteActions from './ProposalPreviewCardRankVoteActions'
import { useVoteStepContext } from '../Context/VoteStepContext'

const FRAGMENT = graphql`
  fragment ProposalPreviewCardFooter_proposal on Proposal
  @argumentDefinitions(stepId: { type: "ID!" }, isAuthenticated: { type: "Boolean!" }) {
    id
    title
    url
    slug
    summary
    body
    author {
      displayName
      media {
        url
      }
    }
    votes(stepId: $stepId, first: 0) {
      totalCount
      totalPointsCount
    }
    paperVotesTotalPointsCount(stepId: $stepId)
    comments {
      totalCount
    }
    likers {
      id
    }
    estimation
    currentVotableStep {
      id
    }
    isArchived
    form {
      objectType
    }
    ...VoteButton_proposal @arguments(isAuthenticated: $isAuthenticated, stepId: $stepId)
    viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
  }
`
const FRAGMENT_STEP = graphql`
  fragment ProposalPreviewCardFooter_step on Step
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, token: { type: "String" }) {
    ...VoteButton_step @arguments(isAuthenticated: $isAuthenticated, token: $token)
    ... on ProposalStep {
      state
      id
      budget
      votesRanking
      votesLimit
      viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
        totalCount
        edges {
          node {
            id
            ... on ProposalUserVote {
              anonymous
            }
            proposal {
              id
            }
          }
        }
      }
    }
  }
`

const FRAGMENT_VIEWER = graphql`
  fragment ProposalPreviewCardFooter_viewer on User @argumentDefinitions(stepId: { type: "ID!" }) {
    ...VoteButton_viewer @arguments(stepId: $stepId)
  }
`

const TextIcon = ({
  icon,
  children,
  color = 'neutral-gray.500',
  ...rest
}: {
  icon: CapUIIcon
  children: React.ReactNode
  color?: string
} & BoxProps) => (
  <Flex alignItems="center">
    <Icon name={icon} color={color} size={CapUIIconSize.Lg} />
    <Box color="neutral-gray.900" fontSize={CapUIFontSize.BodyRegular} fontWeight={600} {...rest}>
      {children}
    </Box>
  </Flex>
)

export const ProposalPreviewCardFooter = ({
  proposal: proposalFragment,
  viewer: viewerFragment,
  step: stepFragment,
  stepId,
  disabled,
}: {
  proposal: ProposalPreviewCardFooter_proposal$key | null | undefined
  viewer: ProposalPreviewCardFooter_viewer$key | null | undefined
  step: ProposalPreviewCardFooter_step$key | null | undefined
  stepId: string
  disabled: boolean
}) => {
  const isMobile = useIsMobile()
  const proposal = useFragment(FRAGMENT, proposalFragment)
  const viewer = useFragment(FRAGMENT_VIEWER, viewerFragment)
  const step = useFragment(FRAGMENT_STEP, stepFragment)
  const { view } = useVoteStepContext()

  if (!proposal || !step) return null

  const { votes, estimation, paperVotesTotalPointsCount, comments, likers } = proposal

  const { viewerVotes, votesRanking, budget, votesLimit } = step

  const hasVoted =
    viewer && proposal?.viewerHasVote
      ? proposal.viewerHasVote
      : viewerVotes?.edges?.some(edge => edge?.node?.proposal?.id === proposal.id) ?? false

  const isFuture = step.state === 'FUTURE'

  if (isFuture) return null

  const showVoteButton =
    step &&
    proposal.currentVotableStep &&
    step.id === proposal.currentVotableStep.id &&
    proposal.form.objectType !== 'ESTABLISHMENT' &&
    !proposal.isArchived

  const votesTotalPointsCount = votes.totalPointsCount + paperVotesTotalPointsCount
  const userPointsNumber = votesLimit - viewerVotes?.edges?.findIndex(edge => edge?.node?.proposal?.id === proposal.id)

  const showComplexVoteInfos = votesRanking || budget
  const showVoteActions = showVoteButton || (votesRanking && view === View.Votes)

  return (
    <Proposal.Content.Footer display="flex" justify={['center', 'normal']} wrap="wrap">
      {showVoteActions || showComplexVoteInfos ? (
        <Flex gap={6} direction={['column', 'row']} align={['center', 'stretch']}>
          {showVoteActions ? (
            <Flex gap={6} className={disabled ? 'disabled' : 'open'}>
              <VoteButton
                stepId={stepId}
                proposalId={proposal.id}
                proposal={proposal}
                step={step}
                viewer={viewer}
                disabled={disabled}
              />
              {votesRanking && view === View.Votes ? (
                <ProposalPreviewCardRankVoteActions
                  stepId={stepId}
                  points={userPointsNumber}
                  proposalId={proposal.id}
                  votes={viewerVotes.edges.map(({ node }) => ({
                    id: node.id,
                    anonymous: node.anonymous,
                    proposalId: node.proposal.id,
                  }))}
                />
              ) : null}
            </Flex>
          ) : null}
          {showComplexVoteInfos ? (
            <Flex gap={6}>
              {votesRanking ? (
                <TextIcon icon={CapUIIcon.Trophy} verticalAlign="top" display="flex">
                  <span>{votesTotalPointsCount}</span>
                  <Box as="span" fontSize={CapUIFontSize.Caption}>
                    pts
                  </Box>
                  {hasVoted ? (
                    <Box as="span" color="primary.base" ml={1}>
                      {`+${userPointsNumber}`}
                    </Box>
                  ) : null}
                </TextIcon>
              ) : null}
              {budget ? <TextIcon icon={CapUIIcon.Budget}>{`${formatBigNumber(estimation || 0)}€`}</TextIcon> : null}
            </Flex>
          ) : null}
        </Flex>
      ) : null}
      {comments.totalCount && !isMobile ? (
        <TextIcon icon={CapUIIcon.BubbleO}>{formatBigNumber(comments.totalCount || 0)}</TextIcon>
      ) : null}
      {likers.length && !isMobile ? (
        <TextIcon icon={CapUIIcon.Heart} color="red.500">
          {formatBigNumber(likers.length || 0)}
        </TextIcon>
      ) : null}
    </Proposal.Content.Footer>
  )
}
export default ProposalPreviewCardFooter
