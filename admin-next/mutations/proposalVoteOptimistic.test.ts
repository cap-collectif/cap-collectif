import {
  applyOptimisticVoteAddition,
  applyOptimisticVoteRemoval,
  areVotesAccounted,
  getRankingPointsDelta,
  getVotePoints,
  getVoteIdForRemoval,
  getVotesAffectedByAddition,
  getVotesAffectedByRemoval,
} from './proposalVoteOptimistic'
import AddProposalVoteMutation from './AddProposalVoteMutation'
import AddProposalSmsVoteMutation from './AddProposalSmsVoteMutation'
import RemoveProposalVoteMutation from './RemoveProposalVoteMutation'
import RemoveProposalSmsVoteMutation from './RemoveProposalSmsVoteMutation'
import commitMutation from './commitMutation'

jest.mock('react-relay', () => ({ graphql: jest.fn() }))
jest.mock('relay-runtime', () => ({ commitLocalUpdate: jest.fn() }))
jest.mock('utils/relay-environement', () => ({ environment: {} }))
jest.mock('./commitMutation', () => ({ __esModule: true, default: jest.fn() }))

const viewerVotes = [
  { id: 'vote-1', proposalId: 'proposal-1', ranking: 0 },
  { id: 'vote-2', proposalId: 'proposal-2', ranking: 1 },
]

describe('proposal vote optimistic state', () => {
  it('updates the vote state optimistically and after a successful mutation', () => {
    const mutation = commitMutation as jest.Mock
    const variables = { input: { proposalId: 'proposal-id', stepId: 'step-id' }, stepId: 'step-id' }

    AddProposalVoteMutation.commit(variables)
    AddProposalSmsVoteMutation.commit(variables)
    RemoveProposalVoteMutation.commit(variables, { proposalId: 'proposal-id', stepId: 'step-id', voteId: 'vote-id' })
    RemoveProposalSmsVoteMutation.commit(variables)

    expect(mutation).toHaveBeenCalledTimes(4)
    for (const [, config] of mutation.mock.calls) {
      expect(config.optimisticUpdater).toEqual(expect.any(Function))
    }
    for (const [, config] of mutation.mock.calls.slice(0, 2)) {
      expect(config.onCompleted).toEqual(expect.any(Function))
    }
    for (const [, config] of mutation.mock.calls.slice(2)) {
      expect(config.updater).toEqual(expect.any(Function))
    }
  })

  it('waits for the server response when a popup vote is removed', () => {
    const mutation = commitMutation as jest.Mock
    const variables = { input: { proposalId: 'proposal-id', stepId: 'step-id' }, stepId: 'step-id' }
    const optimisticData = { proposalId: 'proposal-id', stepId: 'step-id', voteId: 'vote-id' }

    RemoveProposalVoteMutation.commit(variables, optimisticData, false)
    RemoveProposalSmsVoteMutation.commit(variables, false)

    for (const [, config] of mutation.mock.calls) {
      expect(config.optimisticUpdater).toBeUndefined()
      expect(config.updater).toEqual(expect.any(Function))
    }
  })

  it('uses the GraphQL step argument and ignores null connection edges', () => {
    const proposal = {
      setValue: jest.fn(),
      setLinkedRecord: jest.fn(),
      getLinkedRecord: jest.fn().mockReturnValue(null),
      getValue: jest.fn().mockReturnValue(null),
    }
    const viewerVotes = {
      getValue: jest.fn().mockReturnValue(0),
      getLinkedRecords: jest.fn().mockReturnValue([null]),
      setLinkedRecords: jest.fn(),
      setValue: jest.fn(),
    }
    const step = {
      getLinkedRecord: jest.fn().mockReturnValue(viewerVotes),
      getValue: jest.fn().mockReturnValue(null),
    }
    const store = {
      get: jest.fn((id: string) => (id === 'step-id' ? step : id === 'proposal-id' ? proposal : null)),
      create: jest.fn(() => ({ setValue: jest.fn(), setLinkedRecord: jest.fn(), getDataID: () => 'client:vote' })),
    }

    applyOptimisticVoteAddition(store as any, { stepId: 'step-id', proposalId: 'proposal-id' })
    applyOptimisticVoteRemoval(store as any, { stepId: 'step-id', proposalId: 'proposal-id', voteId: 'vote-id' })

    expect(proposal.setValue).toHaveBeenCalledWith(true, 'viewerHasVote', { step: 'step-id' })
    expect(proposal.setValue).toHaveBeenCalledWith(false, 'viewerHasVote', { step: 'step-id' })
    expect(proposal.setLinkedRecord).toHaveBeenCalledWith(expect.anything(), 'viewerVote', { step: 'step-id' })
    expect(proposal.setValue).toHaveBeenCalledWith(null, 'viewerVote', { step: 'step-id' })
    expect(proposal.setValue).not.toHaveBeenCalledWith(true, 'viewerHasVote', { stepId: 'step-id' })
    expect(proposal.setLinkedRecord).not.toHaveBeenCalledWith(expect.anything(), 'viewerVote', { stepId: 'step-id' })
  })

  it('keeps the anonymous value on an optimistic vote', () => {
    const clientVote = { setValue: jest.fn(), setLinkedRecord: jest.fn() }
    const proposal = {
      setValue: jest.fn(),
      setLinkedRecord: jest.fn(),
      getLinkedRecord: jest.fn().mockReturnValue(null),
      getValue: jest.fn().mockReturnValue(null),
    }
    const viewerVotes = {
      getValue: jest.fn().mockReturnValue(0),
      getLinkedRecords: jest.fn().mockReturnValue([]),
      setLinkedRecords: jest.fn(),
      setValue: jest.fn(),
    }
    const step = {
      getLinkedRecord: jest.fn().mockReturnValue(viewerVotes),
      getValue: jest.fn().mockReturnValue(null),
    }
    const store = {
      get: jest.fn((id: string) => (id === 'step-id' ? step : id === 'proposal-id' ? proposal : null)),
      create: jest.fn(() => clientVote),
    }

    applyOptimisticVoteAddition(store as any, { stepId: 'step-id', proposalId: 'proposal-id', anonymously: true })

    expect(clientVote.setValue).toHaveBeenCalledWith(true, 'anonymous')
  })

  it('keeps the ranked vote connection in sync on addition and removal', () => {
    const voteProposal = { getValue: jest.fn().mockReturnValue('proposal-id') }
    const vote = {
      getLinkedRecord: jest.fn().mockReturnValue(voteProposal),
      getValue: jest.fn((field: string) => (field === 'id' ? 'vote-id' : field === 'ranking' ? 0 : null)),
    }
    const edge = { getLinkedRecord: jest.fn().mockReturnValue(vote) }
    const createConnection = () => ({
      getValue: jest.fn((field: string) => (field === 'totalCount' ? 1 : null)),
      getLinkedRecords: jest.fn().mockReturnValue([edge]),
      setLinkedRecords: jest.fn(),
      setValue: jest.fn(),
    })
    const viewerVotes = createConnection()
    const rankedViewerVotes = createConnection()
    const proposal = {
      getValue: jest.fn().mockReturnValue(null),
      getLinkedRecord: jest.fn().mockReturnValue(null),
      setLinkedRecord: jest.fn(),
      setValue: jest.fn(),
    }
    const step = {
      getLinkedRecord: jest.fn((_field: string, args?: unknown) => (args ? rankedViewerVotes : viewerVotes)),
      getValue: jest.fn((field: string) => (field === 'votesRanking' ? true : null)),
    }
    const store = {
      get: jest.fn((id: string) => (id === 'step-id' || id === 'proposal-id' ? (id === 'step-id' ? step : proposal) : null)),
      create: jest.fn(() => ({ setValue: jest.fn(), setLinkedRecord: jest.fn() })),
    }

    applyOptimisticVoteAddition(store as any, { stepId: 'step-id', proposalId: 'proposal-id' })
    applyOptimisticVoteRemoval(store as any, { stepId: 'step-id', proposalId: 'proposal-id', voteId: 'vote-id' })

    expect(rankedViewerVotes.setLinkedRecords).toHaveBeenCalledTimes(2)
    expect(rankedViewerVotes.setValue).toHaveBeenCalledWith(2, 'totalCount')
    expect(rankedViewerVotes.setValue).toHaveBeenCalledWith(0, 'totalCount')
  })

  test.each([
    { votesCount: 0, votesMin: null, expected: true },
    { votesCount: 1, votesMin: 2, expected: false },
    { votesCount: 2, votesMin: 2, expected: true },
  ])('accounts $votesCount votes with a minimum of $votesMin', ({ votesCount, votesMin, expected }) => {
    expect(areVotesAccounted(votesCount, votesMin)).toBe(expected)
  })

  it('accounts all selected proposals when an addition reaches the minimum', () => {
    expect(getVotesAffectedByAddition(viewerVotes.slice(0, 1), 'proposal-2', 1, 2)).toEqual([
      viewerVotes[0],
      { id: 'client:proposal-2', proposalId: 'proposal-2', ranking: 1 },
    ])
  })

  it('does not expose votes before the minimum is reached', () => {
    expect(getVotesAffectedByAddition([], 'proposal-1', 0, 2)).toEqual([])
  })

  it('removes all selected proposal counts when a removal drops below the minimum', () => {
    expect(getVotesAffectedByRemoval(viewerVotes, 'vote-2', 2, 2)).toEqual(viewerVotes)
  })

  it('only removes the targeted proposal when the minimum remains reached', () => {
    expect(getVotesAffectedByRemoval(viewerVotes, 'vote-2', 3, 2)).toEqual([viewerVotes[1]])
  })

  it('uses the current vote id when Relay has replaced the optimistic vote', () => {
    expect(getVoteIdForRemoval(viewerVotes, 'proposal-2', 'client:proposal-vote:step-id:proposal-2')).toBe('vote-2')
  })

  it('calculates ranking points from the maximum vote count', () => {
    expect(getVotePoints(0, 4)).toBe(4)
    expect(getVotePoints(3, 4)).toBe(1)
  })

  it('updates both proposal point counters when rankings are exchanged', () => {
    expect(getRankingPointsDelta(1, 0, 4)).toBe(1)
    expect(getRankingPointsDelta(0, 1, 4)).toBe(-1)
  })
})
