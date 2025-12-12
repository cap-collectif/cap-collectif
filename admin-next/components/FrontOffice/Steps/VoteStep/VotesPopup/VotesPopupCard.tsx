import { Button, CapUIIcon, Card, CardContent, CardCoverPlaceholder, Flex, Icon } from '@cap-collectif/ui'
import { FC } from 'react'
import VotesPopupCardRanking from './VotesPopupCardRanking'
import { graphql, useFragment, useMutation } from 'react-relay'
import { VotesPopupCard_proposalStep$key } from '@relay/VotesPopupCard_proposalStep.graphql'
import { VotesPopupCard_proposalVote$key } from '@relay/VotesPopupCard_proposalVote.graphql'

interface Props {
  step: VotesPopupCard_proposalStep$key
  vote: VotesPopupCard_proposalVote$key
}

const VOTE_FRAGMENT = graphql`
  fragment VotesPopupCard_proposalVote on ProposalVote {
    id
    ...VotesPopupCardRanking_vote
    proposal {
      id
      title
    }
  }
`

const STEP_FRAGMENT = graphql`
  fragment VotesPopupCard_proposalStep on ProposalStep {
    id
    ...VotesPopupCardRanking_step
    votesRanking
  }
`

const REMOVE_VOTE_MUTATION = graphql`
  mutation VotesPopupCardRemoveVoteMutation($input: RemoveProposalVoteInput!) {
    removeProposalVote(input: $input) {
      step {
        id
        viewerVotes {
          edges {
            node {
              id
            }
          }
        }
      }
      proposal {
        id
      }
      previousVoteId
    }
  }
`

const VotesPopupCard: FC<Props> = ({ step: stepKey, vote: voteKey }) => {
  const vote = useFragment(VOTE_FRAGMENT, voteKey)
  const step = useFragment(STEP_FRAGMENT, stepKey)
  const [commitRemoveVote] = useMutation(REMOVE_VOTE_MUTATION)

  const removeVote = () => {
    const voteId = vote.id

    commitRemoveVote({
      variables: {
        input: {
          proposalId: vote.proposal.id,
          stepId: step.id,
        },
      },
      optimisticUpdater: store => {
        const stepRecord = store.get(step.id)
        if (!stepRecord) return
        const connection = stepRecord.getLinkedRecord('viewerVotes')
        if (!connection) return
        const edges = connection.getLinkedRecords('edges') || []
        const newEdges = edges.filter(edge => edge?.getLinkedRecord('node')?.getDataID() !== voteId)
        connection.setLinkedRecords(newEdges, 'edges')
      },
      updater: store => {
        store.delete(voteId)
      },
    })
  }

  return (
    <Flex gap="sm" width="100%" pl="xs" py="xs">
      {step.votesRanking && <VotesPopupCardRanking vote={vote} step={step} />}
      <Card format="horizontal" p="0" _hover={{ boxShadow: 'none' }}>
        {!step.votesRanking && <CardCoverPlaceholder flex="1" />}
        <CardContent flex="1" primaryInfo={vote.proposal.title} />
      </Card>
      <Button variant="tertiary" variantColor="hierarchy" onClick={removeVote}>
        <Icon name={CapUIIcon.TrashO} />
      </Button>
    </Flex>
  )
}

export default VotesPopupCard
