import { FC } from 'react'
import { Box, CapUIFontSize, Flex } from '@cap-collectif/ui'
import { graphql, useFragment } from 'react-relay'
import { VotesPopup_proposalStep$key } from '@relay/VotesPopup_proposalStep.graphql'
import VotesPopupCard from './VotesPopupCard'
import { useIntl } from 'react-intl'

interface Props {
  step: VotesPopup_proposalStep$key
}

const FRAGMENT = graphql`
  fragment VotesPopup_proposalStep on ProposalStep {
    id
    ...VotesPopupCard_proposalStep
    viewerVotes {
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

  return (
    <Flex width="100%" overflowY="auto" justifyContent="flex-start" flexDirection="column" gap="md">
      {/* We must spread because the relay proxy does not support the sort method */}
      {step.viewerVotes.edges.length > 0 ? (
        [...step.viewerVotes.edges]
          .sort((a, b) => a.node.ranking - b.node.ranking)
          .map(edge => <VotesPopupCard key={edge.node.id} step={step} vote={edge.node} />)
      ) : (
        <Box padding="md" textAlign="center" fontSize={CapUIFontSize.BodyLarge}>
          {intl.formatMessage({ id: 'front.proposal.empty-vote' })}
        </Box>
      )}
    </Flex>
  )
}

export default VotesPopup
