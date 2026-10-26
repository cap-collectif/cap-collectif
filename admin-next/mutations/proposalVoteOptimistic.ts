import { RecordSourceSelectorProxy } from 'relay-runtime'

type ViewerVote = {
  id: string
  proposalId: string
  ranking: number | null
}

const POSITION_ORDER = { field: 'POSITION', direction: 'ASC' }

const getViewerVotesConnections = (step: ReturnType<RecordSourceSelectorProxy['get']>) => {
  const viewerVotes = step?.getLinkedRecord('viewerVotes')
  const rankedViewerVotes = step?.getValue('votesRanking')
    ? step.getLinkedRecord('viewerVotes', { orderBy: POSITION_ORDER })
    : null

  return [viewerVotes, rankedViewerVotes].filter(
    (connection): connection is NonNullable<typeof connection> => connection !== null,
  )
}

export const areVotesAccounted = (votesCount: number, votesMin: number | null): boolean =>
  votesMin === null || votesMin === 0 || votesCount >= votesMin

export const getVotesAffectedByAddition = (
  viewerVotes: ViewerVote[],
  proposalId: string,
  currentVotesCount: number,
  votesMin: number | null,
): ViewerVote[] => {
  if (!areVotesAccounted(currentVotesCount + 1, votesMin)) return []

  const newVote = { id: `client:${proposalId}`, proposalId, ranking: currentVotesCount }
  return areVotesAccounted(currentVotesCount, votesMin) ? [newVote] : [...viewerVotes, newVote]
}

export const getVotesAffectedByRemoval = (
  viewerVotes: ViewerVote[],
  removedVoteId: string,
  currentVotesCount: number,
  votesMin: number | null,
): ViewerVote[] => {
  if (!areVotesAccounted(currentVotesCount, votesMin)) return []

  return areVotesAccounted(currentVotesCount - 1, votesMin)
    ? viewerVotes.filter(vote => vote.id === removedVoteId)
    : viewerVotes
}

export const getVoteIdForRemoval = (
  viewerVotes: ViewerVote[],
  proposalId: string,
  voteId: string | null,
): string | null =>
  viewerVotes.find(vote => vote.id === voteId)?.id ?? viewerVotes.find(vote => vote.proposalId === proposalId)?.id ?? null

export const getVotePoints = (ranking: number | null, votesLimit: number | null): number => {
  if (ranking === null || votesLimit === null) return 0
  return Math.max(0, votesLimit - ranking)
}

export const getRankingPointsDelta = (
  previousRanking: number | null,
  nextRanking: number | null,
  votesLimit: number | null,
): number => getVotePoints(nextRanking, votesLimit) - getVotePoints(previousRanking, votesLimit)

export const applyOptimisticVoteAddition = (
  store: RecordSourceSelectorProxy,
  {
    proposalId,
    stepId,
    voteId,
    anonymously = false,
  }: { proposalId: string; stepId: string; voteId?: string; anonymously?: boolean | null },
): void => {
  const step = store.get(stepId)
  const proposal = store.get(proposalId)
  const viewerVotesConnections = getViewerVotesConnections(step)
  const viewerVotes = viewerVotesConnections[0]
  if (!step || !proposal || !viewerVotes) return

  const currentVotesCount = Number(viewerVotes.getValue('totalCount') ?? 0)
  const votesMin = (step.getValue('votesMin') as number | null) ?? null
  const votesLimit = (step.getValue('votesLimit') as number | null) ?? null
  const votesRanking = Boolean(step.getValue('votesRanking'))
  const edges = (viewerVotes.getLinkedRecords('edges') ?? []).filter(
    (edge): edge is NonNullable<typeof edge> => edge != null,
  )
  const existingVotes = edges.flatMap(edge => {
    const vote = edge.getLinkedRecord('node')
    const voteProposal = vote?.getLinkedRecord('proposal')
    const id = vote?.getValue('id')
    const voteProposalId = voteProposal?.getValue('id')
    return typeof id === 'string' && typeof voteProposalId === 'string'
      ? [{ id, proposalId: voteProposalId, ranking: (vote?.getValue('ranking') as number | null) ?? null }]
      : []
  })

  for (const affectedVote of getVotesAffectedByAddition(existingVotes, proposalId, currentVotesCount, votesMin)) {
    const affectedProposal = store.get(affectedVote.proposalId)
    const votes = affectedProposal?.getLinkedRecord('votes', { first: 0, stepId })
    if (!votes) continue
    votes.setValue(Number(votes.getValue('totalCount') ?? 0) + 1, 'totalCount')
    if (votesRanking) {
      votes.setValue(
        Number(votes.getValue('totalPointsCount') ?? 0) + getVotePoints(affectedVote.ranking, votesLimit),
        'totalPointsCount',
      )
    }
  }

  const voteDataId = voteId ?? `client:proposal-vote:${stepId}:${proposalId}`
  const clientVote = store.get(voteDataId) ?? store.create(voteDataId, 'ProposalVote')
  clientVote.setValue(voteDataId, 'id')
  clientVote.setValue('COMPLETED', 'completionStatus')
  clientVote.setValue(Boolean(anonymously), 'anonymous')
  clientVote.setValue(currentVotesCount, 'ranking')
  clientVote.setLinkedRecord(proposal, 'proposal')
  proposal.setValue(true, 'viewerHasVote', { step: stepId })
  proposal.setLinkedRecord(clientVote, 'viewerVote', { step: stepId })

  const clientEdge = store.create(`client:proposal-vote-edge:${stepId}:${proposalId}`, 'ProposalVoteEdge')
  clientEdge.setLinkedRecord(clientVote, 'node')
  const estimation = proposal.getValue('estimation')
  for (const connection of viewerVotesConnections) {
    const connectionEdges = (connection.getLinkedRecords('edges') ?? []).filter(
      (edge): edge is NonNullable<typeof edge> => edge != null,
    )
    connection.setLinkedRecords([...connectionEdges, clientEdge], 'edges')
    connection.setValue(currentVotesCount + 1, 'totalCount')

    const creditsLeft = connection.getValue('creditsLeft')
    if (typeof estimation === 'number' && typeof creditsLeft === 'number') {
      connection.setValue(creditsLeft - estimation, 'creditsLeft')
    }
  }
}

export const applyOptimisticVoteRemoval = (
  store: RecordSourceSelectorProxy,
  { proposalId, stepId, voteId }: { proposalId: string; stepId: string; voteId: string | null },
): void => {
  const step = store.get(stepId)
  const proposal = store.get(proposalId)
  const viewerVotesConnections = getViewerVotesConnections(step)
  const viewerVotes = viewerVotesConnections[0]
  if (!step || !proposal || !viewerVotes) return

  const currentVotesCount = Number(viewerVotes.getValue('totalCount') ?? 0)
  const votesMin = (step.getValue('votesMin') as number | null) ?? null
  const votesLimit = (step.getValue('votesLimit') as number | null) ?? null
  const votesRanking = Boolean(step.getValue('votesRanking'))
  const edges = (viewerVotes.getLinkedRecords('edges') ?? []).filter(
    (edge): edge is NonNullable<typeof edge> => edge != null,
  )
  const existingVotes = edges.flatMap(edge => {
    const vote = edge.getLinkedRecord('node')
    const voteProposal = vote?.getLinkedRecord('proposal')
    const id = vote?.getValue('id')
    const voteProposalId = voteProposal?.getValue('id')
    return typeof id === 'string' && typeof voteProposalId === 'string'
      ? [{ id, proposalId: voteProposalId, ranking: (vote?.getValue('ranking') as number | null) ?? null }]
      : []
  })
  const removedVoteId = getVoteIdForRemoval(existingVotes, proposalId, voteId) ?? voteId
  if (!removedVoteId) return

  for (const affectedVote of getVotesAffectedByRemoval(existingVotes, removedVoteId, currentVotesCount, votesMin)) {
    const affectedProposal = store.get(affectedVote.proposalId)
    const votes = affectedProposal?.getLinkedRecord('votes', { first: 0, stepId })
    if (!votes) continue
    votes.setValue(Math.max(0, Number(votes.getValue('totalCount') ?? 0) - 1), 'totalCount')
    if (votesRanking) {
      votes.setValue(
        Math.max(0, Number(votes.getValue('totalPointsCount') ?? 0) - getVotePoints(affectedVote.ranking, votesLimit)),
        'totalPointsCount',
      )
    }
  }

  proposal.setValue(false, 'viewerHasVote', { step: stepId })
  proposal.setValue(null, 'viewerVote', { step: stepId })
  const estimation = proposal.getValue('estimation')
  for (const connection of viewerVotesConnections) {
    const connectionEdges = (connection.getLinkedRecords('edges') ?? []).filter(
      (edge): edge is NonNullable<typeof edge> => edge != null,
    )
    connection.setValue(Math.max(0, currentVotesCount - 1), 'totalCount')
    connection.setLinkedRecords(
      connectionEdges.filter(edge => edge.getLinkedRecord('node')?.getValue('id') !== removedVoteId),
      'edges',
    )

    const creditsLeft = connection.getValue('creditsLeft')
    if (typeof estimation === 'number' && typeof creditsLeft === 'number') {
      connection.setValue(creditsLeft + estimation, 'creditsLeft')
    }
  }
}
