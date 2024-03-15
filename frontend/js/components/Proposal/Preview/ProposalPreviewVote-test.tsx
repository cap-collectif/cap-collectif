/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import ProposalPreviewVote from './ProposalPreviewVote'
import MockProviders, { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import type { ProposalPreviewVoteTestQuery } from '~relay/ProposalPreviewVoteTestQuery.graphql'

describe('<ProposalPreviewVote />', () => {
  let environment
  let TestComponent
  let testComponentTree
  const defaultMockResolvers = {
    Proposal: () => ({
      id: '1',
    }),
    Step: () => ({}),
    Viewer: () => ({}),
  }
  const query = graphql`
    query ProposalPreviewVoteTestQuery(
      $stepId: ID = "<default>"
      $isAuthenticated: Boolean!
      $proposalId: ID = "<default>"
    ) @relay_test_operation {
      proposal: node(id: $proposalId) {
        ...ProposalPreviewVote_proposal @arguments(isAuthenticated: $isAuthenticated, stepId: $stepId)
      }
      step: node(id: $stepId) {
        ...ProposalPreviewVote_step @arguments(isAuthenticated: $isAuthenticated)
      }
      viewer {
        ...ProposalPreviewVote_viewer @arguments(stepId: $stepId)
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
      const data = useLazyLoadQuery<ProposalPreviewVoteTestQuery>(query, {
        proposalId: 'proposal1',
        stepId: 'step1',
        isAuthenticated: true,
      })
      if (!data.proposal || !data.step || !data.viewer) return null
      return <ProposalPreviewVote step={data.step} proposal={data.proposal} viewer={data.viewer} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <MockProviders store={{}} useCapUIProvider>
          <TestRenderer {...props} />
        </MockProviders>
      </RelaySuspensFragmentTest>
    )
  })
  it('should render a proposal preview vote', () => {
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
