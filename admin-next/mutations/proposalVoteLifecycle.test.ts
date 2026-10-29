import { commitLocalUpdate, createOperationDescriptor, createReaderSelector } from 'relay-runtime'
import { createMockEnvironment } from 'relay-test-utils'
import stepFragment, { VoteButton_step$data } from '@relay/VoteButton_step.graphql'
import addVoteOperation from '@relay/AddProposalVoteMutation.graphql'
import AddProposalVoteMutation from './AddProposalVoteMutation'
import AddProposalSmsVoteMutation from './AddProposalSmsVoteMutation'
import RemoveProposalVoteMutation from './RemoveProposalVoteMutation'
import RemoveProposalSmsVoteMutation from './RemoveProposalSmsVoteMutation'

let mockEnvironment: ReturnType<typeof createMockEnvironment>

jest.mock('utils/relay-environement', () => ({
  get environment() {
    return mockEnvironment
  },
}))

const variables = { input: { proposalId: 'proposal-id', stepId: 'step-id' }, stepId: 'step-id' }
const owner = createOperationDescriptor(addVoteOperation, { input: variables.input }).request
const stepSelector = createReaderSelector(stepFragment, 'step-id', { isAuthenticated: false }, owner)

const readVotes = () => (mockEnvironment.lookup(stepSelector).data as VoteButton_step$data).viewerVotes

/**
 * @jest-status compliant
 * @jest-reason Exercises repeated vote mutations with a real Relay store and controlled server responses.
 */
describe('proposal vote lifecycle', () => {
  beforeEach(() => {
    mockEnvironment = createMockEnvironment()
    commitLocalUpdate(mockEnvironment, store => {
      const step = store.create('step-id', 'SelectionStep').setValue('step-id', 'id')
      const proposal = store.create('proposal-id', 'Proposal').setValue('proposal-id', 'id')
      proposal.setValue(10, 'estimation')
      const votes = store.create('viewer-votes', 'ProposalVoteConnection')
      votes.setValue(0, 'totalCount').setValue(100, 'creditsLeft').setLinkedRecords([], 'edges')
      step.setLinkedRecord(votes, 'viewerVotes')
    })
  })

  it.each([
    {
      participant: 'authenticated',
      add: () => AddProposalVoteMutation.commit(variables),
      remove: (voteId: string) => RemoveProposalVoteMutation.commit(variables, { ...variables.input, voteId }),
      addField: 'addProposalVote',
      removeField: 'removeProposalVote',
      removePayload: { __typename: 'RemoveProposalVotePayload' },
    },
    {
      participant: 'anonymous',
      add: () => AddProposalSmsVoteMutation.commit(variables),
      remove: () => RemoveProposalSmsVoteMutation.commit(variables),
      addField: 'addProposalSmsVote',
      removeField: 'removeProposalSmsVote',
      removePayload: { errorCode: null },
    },
  ])(
    'allows an $participant participant to vote again after removal',
    async ({ add, remove, addField, removeField, removePayload }) => {
      for (const voteId of ['vote-1', 'vote-2', 'vote-3']) {
        const vote = { id: voteId, completionStatus: 'COMPLETED' }
        const addition = expect(add()).resolves.toMatchObject({ [addField]: { vote } })
        mockEnvironment.mock.resolveMostRecentOperation({
          data: { [addField]: { errorCode: null, participantToken: null, vote } },
        })
        await addition

        expect(readVotes()).toEqual({
          totalCount: 1,
          creditsLeft: 90,
          edges: [{ node: { ...vote, ranking: 0, proposal: { id: 'proposal-id' } } }],
        })

        const removal = expect(remove(voteId)).resolves.toHaveProperty(removeField)
        mockEnvironment.mock.resolveMostRecentOperation({
          data: { [removeField]: { ...removePayload, previousVoteId: voteId } },
        })
        await removal

        expect(readVotes()).toEqual({ totalCount: 0, creditsLeft: 100, edges: [] })
      }
    },
  )
})
