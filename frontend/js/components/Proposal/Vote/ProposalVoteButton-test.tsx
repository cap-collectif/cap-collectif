/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import ProposalVoteButton from './ProposalVoteButton'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import type { ProposalVoteButtonTestQuery } from '~relay/ProposalVoteButtonTestQuery.graphql'

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
        ...ProposalVoteButton_step
      }
    }
  `
  afterEach(() => {
    clearSupportForPortals()
  })
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = props => {
      const data = useLazyLoadQuery<ProposalVoteButtonTestQuery>(query, {
        proposalId: 'proposal1',
        id: 'step1',
        isAuthenticated: true,
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

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )
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
