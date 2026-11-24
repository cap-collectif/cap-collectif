import { Box, CapUIFontSize, Flex } from '@cap-collectif/ui'
import { VotesPopup_proposalStep$key } from '@relay/VotesPopup_proposalStep.graphql'
import { getContributionObjectTypeTranslationKey } from '@shared/constants/proposalStepObjectType'
import { getVoteAction } from '@shared/utils/getVoteAction'
import { FC } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import VotesPopupCard from './VotesPopupCard'

interface Props {
  step: VotesPopup_proposalStep$key
}

const FRAGMENT = graphql`
  fragment VotesPopup_proposalStep on ProposalStep {
    id
    actionButtonLabel
    votesRanking
    form {
      objectType
    }
    ...VotesPopupCard_proposalStep
    defaultViewerVotes: viewerVotes {
      edges {
        node {
          id
          ranking
          proposal {
            id
          }
          ...VotesPopupCard_proposalVote
        }
      }
    }
    rankedViewerVotes: viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
      edges {
        node {
          id
          ranking
          proposal {
            id
          }
          ...VotesPopupCard_proposalVote
        }
      }
    }
  }
`

const VotesPopup: FC<Props> = ({ step: stepKey }) => {
  const intl = useIntl()
  const step = useFragment(FRAGMENT, stepKey)
  const emptyVoteLabelId = {
    VOTE: `front.contribution.${getContributionObjectTypeTranslationKey(step.form?.objectType)}.empty-vote`,
    SUPPORT: 'front.proposal.empty-support',
    SIGN: 'front.proposal.empty-signature',
  }[getVoteAction(step.actionButtonLabel)]
  const viewerVotes = step.votesRanking ? step.rankedViewerVotes : step.defaultViewerVotes

  return (
    <Flex id="votes-list" width="100%" justifyContent="flex-start" flexDirection="column" gap="md">
      {/* We must spread because the relay proxy does not support the sort method */}
      {viewerVotes.edges.length > 0 ? (
        [...viewerVotes.edges]
          .sort((a, b) => a.node.ranking - b.node.ranking)
          .map(edge => <VotesPopupCard key={edge.node.id} step={step} vote={edge.node} />)
      ) : (
        <Box padding="md" textAlign="center" fontSize={CapUIFontSize.BodyLarge}>
          {intl.formatMessage({ id: emptyVoteLabelId })}
        </Box>
      )}
    </Flex>
  )
}

export default VotesPopup
