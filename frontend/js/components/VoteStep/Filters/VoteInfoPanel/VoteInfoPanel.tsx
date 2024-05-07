import * as React from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import type { VoteInfoPanelQuery } from '~relay/VoteInfoPanelQuery.graphql'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { GlobalState } from '~/types'
import CookieMonster from '~/CookieMonster'
import { SimpleVote, VoteBudget, VoteMinMax, VoteValidated } from './VoteInfoPanelCases'
import { Box } from '@cap-collectif/ui'

const QUERY = graphql`
  query VoteInfoPanelQuery($stepId: ID!, $token: String, $isAuthenticated: Boolean!) {
    viewer @include(if: $isAuthenticated) {
      proposalVotes(stepId: $stepId) {
        totalCount
        creditsLeft
      }
    }
    step: node(id: $stepId) {
      ... on ProposalStep {
        votesMin
        votable
        votesLimit
        votesRanking
        votesHelpText
        budget
        isSecretBallot
        viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
          totalCount
          creditsLeft
        }
      }
    }
  }
`

const VoteInfoPanel: React.FC<{ stepId: string; isMobile?: boolean }> = ({ stepId, isMobile = false }) => {
  const isAuthenticated = useSelector((state: GlobalState) => state.user.user) !== null
  const { step, viewer } = useLazyLoadQuery<VoteInfoPanelQuery>(QUERY, {
    stepId,
    token: CookieMonster.getAnonymousAuthenticatedWithConfirmedPhone(),
    isAuthenticated,
  })
  const intl = useIntl()

  if (!step || !step?.votable) return null

  const { votesLimit, votesMin, votesRanking, votesHelpText, budget } = step

  const viewerVotes = isAuthenticated ? viewer?.proposalVotes?.totalCount : step.viewerVotes?.totalCount
  const creditsLeft = isAuthenticated ? viewer?.proposalVotes?.creditsLeft : step.viewerVotes?.creditsLeft

  const hasVoteMin = votesMin && votesMin > 1

  const isSimpleVote = !votesLimit && !hasVoteMin && !votesRanking && !budget
  const isVoteValidated =
    (hasVoteMin && viewerVotes >= votesMin) ||
    (!hasVoteMin && votesLimit && viewerVotes === votesLimit) ||
    (votesMin === 1 && viewerVotes > 0)
  const isVoteComplete = !votesRanking && isVoteValidated && (!votesLimit || viewerVotes === votesLimit)

  const label = intl.formatMessage({ id: 'admin.fields.step.votesHelpText' })

  if (isSimpleVote && !votesHelpText) return null

  const getPanel = () => {
    if (isSimpleVote) return <SimpleVote label={label} votesHelpText={votesHelpText} />

    if (budget)
      return (
        <VoteBudget label={label} votesHelpText={votesHelpText} creditsLeft={creditsLeft} viewerVotes={viewerVotes} />
      )

    if (isVoteValidated)
      return (
        <VoteValidated
          isVoteComplete={isVoteComplete}
          label={label}
          votesHelpText={votesHelpText}
          hasVoteMin={hasVoteMin}
          viewerVotes={viewerVotes}
          votesLimit={votesLimit}
          votesMin={votesMin}
          votesRanking={votesRanking}
        />
      )
    return (
      <VoteMinMax
        label={label}
        votesHelpText={votesHelpText}
        hasVoteMin={hasVoteMin}
        viewerVotes={viewerVotes}
        votesLimit={votesLimit}
        votesMin={votesMin}
      />
    )
  }

  return isMobile ? (
    <Box pb={6} mx={4} zIndex={9} bg="neutral-gray.100">
      {getPanel()}
    </Box>
  ) : (
    getPanel()
  )
}

export default VoteInfoPanel
