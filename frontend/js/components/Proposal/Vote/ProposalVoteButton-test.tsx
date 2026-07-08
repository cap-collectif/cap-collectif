/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { act } from 'react-dom/test-utils'
import ProposalVoteButton from './ProposalVoteButton'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import type { ProposalVoteButtonTestQuery } from '~relay/ProposalVoteButtonTestQuery.graphql'
import AddProposalSmsVoteMutation from '~/mutations/AddProposalSmsVoteMutation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'

jest.mock('~/mutations/AddProposalSmsVoteMutation', () => ({
  commit: jest.fn(),
}))

jest.mock('~/components/Utils/MutationErrorToast', () => ({
  mutationErrorToast: jest.fn(),
}))

describe('<ProposalVoteButton />', () => {
  let environment
  let TestComponent
  let testComponentTree
  const defaultMockResolvers = {
    Proposal: () => ({
      id: 'proposal1',
      viewerHasVote: false,
      viewerVote: null,
      form: {
        objectType: 'PROPOSAL',
      },
      project: {
        type: {
          title: 'global.consultation',
        },
      },
    }),
    Step: () => ({
      id: 'stepId',
      votesRanking: true,
      viewerVotes: {
        totalCount: 0,
        edges: [],
      },
    }),
  }
  const defaultProps = {
    id: 'buttonID',
  }
  const query = graphql`
    query ProposalVoteButtonTestQuery($id: ID = "<default>", $isAuthenticated: Boolean!, $proposalId: ID = "<default>")
    @relay_test_operation {
      proposal: node(id: $proposalId) {
        ...ProposalVoteButton_proposal @arguments(isAuthenticated: $isAuthenticated, stepId: $id)
      }
      step: node(id: $id) {
        ...ProposalVoteButton_step @arguments(isAuthenticated: $isAuthenticated)
      }
    }
  `
  afterEach(() => {
    clearSupportForPortals()
    jest.clearAllMocks()
    localStorage.clear()
  })
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = props => {
      const isAuthenticated = props.isAuthenticated ?? true
      const data = useLazyLoadQuery<ProposalVoteButtonTestQuery>(query, {
        proposalId: 'proposal1',
        id: 'step1',
        isAuthenticated,
      })
      if (!data.proposal || !data.step) return null
      return (
        <ProposalVoteButton
          disabled={false}
          proposal={data.proposal}
          currentStep={data.step}
          isHovering={false}
          hasVoted
          {...defaultProps}
          {...props}
        />
      )
    }

    TestComponent = ({ store, ...props }) => (
      <RelaySuspensFragmentTest environment={environment} store={store}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )
  })
  it('handles anonymous vote mutation network errors', async () => {
    ;(AddProposalSmsVoteMutation.commit as jest.Mock).mockRejectedValue(new TypeError('Load failed'))
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        Proposal: () => ({
          id: 'proposal1',
          contributorVote: null,
          votes: {
            totalCount: 0,
          },
        }),
        ProposalVote: () => ({
          completionStatus: 'PUBLISHED',
        }),
        ProposalStep: () => ({
          id: 'step1',
          votesRanking: false,
          votesMin: 1,
          viewerVotes: {
            totalCount: 0,
            edges: [],
          },
        }),
        RequirementConnection: () => ({
          participantMeetsTheRequirements: false,
        }),
      }),
    )
    const triggerRequirementsModal = jest.fn()
    testComponentTree = ReactTestRenderer.create(
      <TestComponent
        hasVoted={false}
        isAuthenticated={false}
        usesNewUI
        store={{
          user: {
            user: null,
          },
        }}
        triggerRequirementsModal={triggerRequirementsModal}
      />,
    )

    const voteButton = testComponentTree.root.findAll(
      node =>
        node.type === 'button' &&
        node.props.id === 'proposal-vote-btn-proposal1' &&
        typeof node.props.onClick === 'function',
    )[0]

    expect(voteButton).toBeDefined()

    await act(async () => {
      await expect(voteButton.props.onClick()).resolves.toBeUndefined()
    })

    expect(triggerRequirementsModal).not.toHaveBeenCalled()
    expect(AddProposalSmsVoteMutation.commit).toHaveBeenCalledTimes(1)
    expect(mutationErrorToast).toHaveBeenCalledTimes(1)
  })
  it('renders viewer has not voted', () => {
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
    testComponentTree = ReactTestRenderer.create(<TestComponent hasVoted={false} />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('renders viewer has voted', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        Proposal: () => ({
          id: 'proposal1',
          viewerHasVote: true,
          viewerVote: {
            id: 'vote1',
            ranking: null,
          },
          form: {
            objectType: 'PROPOSAL',
          },
          project: {
            type: {
              title: 'global.consultation',
            },
          },
        }),
      }),
    )
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('renders viewer has voted and hovering', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        Proposal: () => ({
          id: 'proposal1',
          viewerHasVote: true,
          viewerVote: {
            id: 'vote1',
            ranking: null,
          },
          form: {
            objectType: 'PROPOSAL',
          },
          project: {
            type: {
              title: 'global.consultation',
            },
          },
        }),
      }),
    )
    testComponentTree = ReactTestRenderer.create(<TestComponent isHovering />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('renders viewer has voted and hovering with ranking', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        Proposal: () => ({
          id: 'proposal1',
          viewerHasVote: true,
          viewerVote: {
            id: 'vote1',
            ranking: 0,
          },
          form: {
            objectType: 'PROPOSAL',
          },
          project: {
            type: {
              title: 'global.consultation',
            },
          },
        }),
      }),
    )
    testComponentTree = ReactTestRenderer.create(<TestComponent isHovering />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
