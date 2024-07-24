/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import ProposalFollowButton from './ProposalFollowButton'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import type { ProposalFollowButtonTestQuery } from '~relay/ProposalFollowButtonTestQuery.graphql'

describe('<ProposalFollowButton />', () => {
  let environment
  let testComponentTree
  let TestProposalFollowButton
  const query = graphql`
    query ProposalFollowButtonTestQuery($id: ID = "<default>", $isAuthenticated: Boolean!) @relay_test_operation {
      proposal: node(id: $id) {
        ...ProposalFollowButton_proposal @arguments(isAuthenticated: $isAuthenticated)
      }
    }
  `
  const defaultMockResolvers = {
    Proposal: () => ({
      id: 'proposal1',
      viewerIsFollowing: true,
      viewerFollowingConfiguration: 'MINIMAL',
    }),
  }
  const secondaryMockResolvers = {
    Proposal: () => ({
      id: 'proposal1',
      viewerIsFollowing: false,
      viewerFollowingConfiguration: null,
    }),
  }
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    const queryVariables = {
      id: 'proposal1',
      isAuthenticated: true,
    }

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<ProposalFollowButtonTestQuery>(query, variables)
      if (!data.proposal) return null
      return <ProposalFollowButton proposal={data.proposal} {...componentProps} />
    }

    TestProposalFollowButton = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  afterEach(() => {
    clearSupportForPortals()
  })
  describe('<TestProposalFollowButton />', () => {
    it('should render a button to unfollow a proposal when viewer is following ', () => {
      testComponentTree = ReactTestRenderer.create(<TestProposalFollowButton isAuthenticated />)
      expect(testComponentTree).toMatchSnapshot()
    })
    it('should render a button to follow a proposal when viewer is not following.', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, secondaryMockResolvers),
      )
      testComponentTree = ReactTestRenderer.create(<TestProposalFollowButton isAuthenticated />)
      expect(testComponentTree).toMatchSnapshot()
    })
    it('should render correctly when not authenticated', () => {
      environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, null))
      testComponentTree = ReactTestRenderer.create(<TestProposalFollowButton isAuthenticated={false} />)
      expect(testComponentTree).toMatchSnapshot()
    })
  })
})
