import { Box, CapUIIcon, Flex, Icon, Text } from '@cap-collectif/ui'
import { VotesPopupCardRanking_vote$key } from '@relay/VotesPopupCardRanking_vote.graphql'
import { VotesPopupCardRanking_step$key } from '@relay/VotesPopupCardRanking_step.graphql'
import { FC } from 'react'
import { graphql, useFragment, useMutation } from 'react-relay'
import { areVotesAccounted, getRankingPointsDelta } from '@mutations/proposalVoteOptimistic'

interface Props {
  vote: VotesPopupCardRanking_vote$key
  step: VotesPopupCardRanking_step$key
}

const VOTE_FRAGMENT = graphql`
  fragment VotesPopupCardRanking_vote on ProposalVote {
    id
    anonymous
    ranking
  }
`

const STEP_FRAGMENT = graphql`
  fragment VotesPopupCardRanking_step on ProposalStep {
    __typename
    id
    votesLimit
    votesMin
    rankedViewerVotes: viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
      edges {
        node {
          id
          anonymous
          ranking
          proposal {
            id
          }
        }
      }
    }
  }
`

const UPDATE_VOTES_MUTATION = graphql`
  mutation VotesPopupCardRankingUpdateVotesMutation($input: UpdateProposalVotesInput!, $stepId: ID!) {
    updateProposalVotes(input: $input) {
      step {
        ...VotesPopup_proposalStep
        rankedViewerVotes: viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
          totalCount
          edges {
            node {
              id
              ranking
              proposal {
                id
                votes(stepId: $stepId, first: 0) {
                  totalPointsCount
                }
              }
            }
          }
        }
      }
    }
  }
`

const VotesPopupCardRanking: FC<Props> = ({ vote: voteKey, step: stepKey }) => {
  const vote = useFragment(VOTE_FRAGMENT, voteKey)
  const step = useFragment(STEP_FRAGMENT, stepKey)
  const [commitUpdateVotes, isLoading] = useMutation(UPDATE_VOTES_MUTATION)
  const maxPoints = step.votesLimit !== null ? step.votesLimit : step.votesMin

  const updateVoteRanking = (votes, voteId, delta) => {
    votes.sort((a, b) => a.node.ranking - b.node.ranking)
    const voteIndex = votes.findIndex(edge => edge.node.id === voteId)
    const voteTmp = votes[voteIndex]
    if (delta > 0 && votes[voteIndex + 1]) {
      votes[voteIndex] = votes[voteIndex + 1]
      votes[voteIndex + 1] = voteTmp
    }
    if (delta < 0 && votes[voteIndex - 1]) {
      votes[voteIndex] = votes[voteIndex - 1]
      votes[voteIndex - 1] = voteTmp
    }
    votes.forEach((edge, i) => (edge.node.ranking = i))
    return votes
  }

  const handleUpdate = (delta: number) => {
    const newRanking = vote.ranking + delta
    if (newRanking < 0 || newRanking > step.rankedViewerVotes.edges.length - 1) return
    handleUpdateRanking(vote.id, delta)
  }

  const handleUpdateRanking = (voteId: string, delta: number) => {
    // Make a copy of the votes removing the references and readonly
    let updatedVotes = structuredClone(step.rankedViewerVotes.edges)
    updatedVotes = updateVoteRanking(updatedVotes, voteId, delta)
    const normalisedVotes = updatedVotes.map(edge => ({ id: edge.node.id, anonymous: edge.node.anonymous }))

    commitUpdateVotes({
      variables: {
        input: {
          step: step.id,
          votes: normalisedVotes,
        },
        stepId: step.id,
      },
      optimisticUpdater: store => {
        const stepRecord = store.get(step.id)
        if (!stepRecord) return

        const connection = stepRecord.getLinkedRecord('viewerVotes', {
          orderBy: { field: 'POSITION', direction: 'ASC' },
        })
        if (!connection) return

        const existingEdges = connection.getLinkedRecords('edges')
        if (!existingEdges) return

        const currentVotesCount = Number(connection.getValue('totalCount') ?? 0)
        if (!areVotesAccounted(currentVotesCount, step.votesMin)) return

        const edgesById = new Map(
          existingEdges.map(edgeRecord => [edgeRecord.getLinkedRecord('node')?.getValue('id'), edgeRecord]),
        )

        const reorderedEdges = updatedVotes.map(({ node }) => edgesById.get(node.id)).filter(Boolean)

        reorderedEdges.forEach((edgeRecord, index) => {
          const nodeRecord = edgeRecord.getLinkedRecord('node')
          if (!nodeRecord) return

          const previousRanking = Number(nodeRecord.getValue('ranking') ?? 0)
          nodeRecord.setValue(index, 'ranking')

          const proposal = nodeRecord.getLinkedRecord('proposal')
          const votes = proposal?.getLinkedRecord('votes', { first: 0, stepId: step.id })
          if (!votes) return

          votes.setValue(
            Number(votes.getValue('totalPointsCount') ?? 0) +
              getRankingPointsDelta(previousRanking, index, step.votesLimit),
            'totalPointsCount',
          )
        })

        connection.setLinkedRecords(reorderedEdges, 'edges')
      },
    })
  }

  return (
    <Flex flexDirection="column" px="xxs" justifyContent="center" alignItems="center">
      <Box
        as="button"
        onClick={() => handleUpdate(-1)}
        opacity={isLoading || vote.ranking <= 0 ? 0.3 : 1}
        disabled={isLoading || vote.ranking <= 0}
        sx={{ cursor: isLoading || vote.ranking <= 0 ? 'default' : 'pointer' }}
      >
        <Icon name={CapUIIcon.ArrowUpO} />
      </Box>
      <Text>+{maxPoints - vote.ranking}pts</Text>
      <Box
        as="button"
        onClick={() => handleUpdate(1)}
        opacity={isLoading || vote.ranking == step.rankedViewerVotes.edges.length - 1 ? 0.3 : 1}
        disabled={isLoading || vote.ranking == step.rankedViewerVotes.edges.length - 1}
        sx={{ cursor: isLoading || vote.ranking == step.rankedViewerVotes.edges.length - 1 ? 'default' : 'pointer' }}
      >
        <Icon name={CapUIIcon.ArrowDownO} />
      </Box>
    </Flex>
  )
}

export default VotesPopupCardRanking
