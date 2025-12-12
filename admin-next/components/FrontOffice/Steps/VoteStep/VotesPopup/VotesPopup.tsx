import { FC } from 'react'
import { Flex } from '@cap-collectif/ui'
import { graphql, useFragment } from 'react-relay'
import { VotesPopup_proposalStep$key } from '@relay/VotesPopup_proposalStep.graphql'
import VotesPopupCard from './VotesPopupCard'

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

const VoteStepUserVotesPopup: FC<Props> = ({ step: stepKey }) => {
  const step = useFragment(FRAGMENT, stepKey)

  return (
    <Flex width="100%" maxHeight="100vh" overflowY="auto" justifyContent="flex-start" flexDirection="column" gap="md">
      {/* We must spread because the relay proxy does not support the sort method */}
      {[...step.viewerVotes.edges]
        .sort((a, b) => a.node.ranking - b.node.ranking)
        .map(edge => (
          <VotesPopupCard key={edge.node.id} step={step} vote={edge.node} />
        ))}
    </Flex>
  )
}

export default VoteStepUserVotesPopup
