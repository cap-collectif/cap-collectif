import { Box, CapUIIcon, Flex, Icon, Text } from '@cap-collectif/ui'
import type { VotesPopupCardRanking_vote$key } from '@relay/VotesPopupCardRanking_vote.graphql'
import type { VotesPopupCardRanking_step$key } from '@relay/VotesPopupCardRanking_step.graphql'
import type { FC } from 'react'
import type { PayloadError, RecordSourceSelectorProxy } from 'relay-runtime'
import { useIntl } from 'react-intl'
import { mutationErrorToast } from '@shared/utils/toasts'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import CookieMonster from '@shared/utils/CookieMonster'
import type { VotesPopupCardRankingUpdateVotesMutation } from '@relay/VotesPopupCardRankingUpdateVotesMutation.graphql'
import type { VotesPopupCardRankingUpdateAnonymousVotesMutation } from '@relay/VotesPopupCardRankingUpdateAnonymousVotesMutation.graphql'
import { graphql, useFragment, useMutation } from 'react-relay'
import { areVotesAccounted, getRankingPointsDelta } from '@mutations/proposalVoteOptimistic'

interface Props {
  vote: VotesPopupCardRanking_vote$key
  step: VotesPopupCardRanking_step$key
}

const VOTE_FRAGMENT = graphql`
  fragment VotesPopupCardRanking_vote on ProposalVote {
    id
    ranking
  }
`

const STEP_FRAGMENT = graphql`
  fragment VotesPopupCardRanking_step on ProposalStep {
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

const UPDATED_STEP_FRAGMENT = graphql`
  fragment VotesPopupCardRanking_updatedStep on ProposalStep @argumentDefinitions(stepId: { type: "ID!" }) {
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
`

const UPDATE_VOTES_MUTATION = graphql`
  mutation VotesPopupCardRankingUpdateVotesMutation($input: UpdateProposalVotesInput!, $stepId: ID!) {
    updateProposalVotes(input: $input) {
      step {
        ...VotesPopupCardRanking_updatedStep @arguments(stepId: $stepId)
      }
    }
  }
`

const UPDATE_ANONYMOUS_VOTES_MUTATION = graphql`
  mutation VotesPopupCardRankingUpdateAnonymousVotesMutation($input: UpdateAnonymousProposalVotesInput!, $stepId: ID!) {
    updateAnonymousProposalVotes(input: $input) {
      step {
        ...VotesPopupCardRanking_updatedStep @arguments(stepId: $stepId)
      }
    }
  }
`

const VotesPopupCardRanking: FC<Props> = ({ vote: voteKey, step: stepKey }) => {
  const vote = useFragment(VOTE_FRAGMENT, voteKey)
  const step = useFragment(STEP_FRAGMENT, stepKey)
  const { viewerSession } = useAppContext()
  const intl = useIntl()
  const [commitUpdateVotes, isUpdatingVotes] =
    useMutation<VotesPopupCardRankingUpdateVotesMutation>(UPDATE_VOTES_MUTATION)
  const [commitUpdateAnonymousVotes, isUpdatingAnonymousVotes] =
    useMutation<VotesPopupCardRankingUpdateAnonymousVotesMutation>(UPDATE_ANONYMOUS_VOTES_MUTATION)
  const isLoading = isUpdatingVotes || isUpdatingAnonymousVotes
  const maxPoints = step.votesLimit !== null ? step.votesLimit : step.votesMin

  const handleUpdate = (delta: -1 | 1) => {
    if (isLoading) return

    const orderedVotes = (step.rankedViewerVotes.edges ?? [])
      .flatMap(edge => (edge?.node ? [edge.node] : []))
      .sort((a, b) => (a.ranking ?? 0) - (b.ranking ?? 0))
    const currentIndex = orderedVotes.findIndex(node => node.id === vote.id)
    const nextIndex = currentIndex + delta
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= orderedVotes.length) return

    const token = viewerSession ? null : CookieMonster.getParticipantCookie()
    if (!viewerSession && !token) {
      mutationErrorToast(intl)
      return
    }

    const normalisedVotes = orderedVotes.map(({ id, anonymous }) => ({ id, anonymous }))
    const [movedVote] = normalisedVotes.splice(currentIndex, 1)
    normalisedVotes.splice(nextIndex, 0, movedVote)

    const input = {
      step: step.id,
      votes: normalisedVotes,
    }

    const config = {
      onCompleted: (_response: unknown, errors: ReadonlyArray<PayloadError> | null) => {
        if (errors?.length) mutationErrorToast(intl)
      },
      onError: () => mutationErrorToast(intl),
      optimisticUpdater: (store: RecordSourceSelectorProxy) => {
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

        const reorderedEdges = normalisedVotes.map(({ id }) => edgesById.get(id)).filter(Boolean)

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
    }

    if (viewerSession) {
      commitUpdateVotes({
        ...config,
        variables: { input, stepId: step.id },
      })
    } else {
      commitUpdateAnonymousVotes({
        ...config,
        variables: {
          input: { ...input, token },
          stepId: step.id,
        },
      })
    }
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
        opacity={isLoading || vote.ranking === step.rankedViewerVotes.edges.length - 1 ? 0.3 : 1}
        disabled={isLoading || vote.ranking === step.rankedViewerVotes.edges.length - 1}
        sx={{ cursor: isLoading || vote.ranking === step.rankedViewerVotes.edges.length - 1 ? 'default' : 'pointer' }}
      >
        <Icon name={CapUIIcon.ArrowDownO} />
      </Box>
    </Flex>
  )
}

export default VotesPopupCardRanking
