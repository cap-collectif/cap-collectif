/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import VoteButton from './VoteButton'
import MockProviders, { RelaySuspensFragmentTest, addsSupportForPortals, clearSupportForPortals } from '~/testUtils'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import type { VoteButtonTestQuery } from '~relay/VoteButtonTestQuery.graphql'

describe('<VoteButton />', () => {
  let environment: any
  let testComponentTree: any
  let TestVoteButton: any

  const query = graphql`
    query VoteButtonTestQuery($isAuthenticated: Boolean!) @relay_test_operation {
      proposal: node(id: "<proposalId>") {
        ... on Proposal {
          ...VoteButton_proposal @arguments(stepId: "<stepId>", isAuthenticated: $isAuthenticated)
        }
      }
      step: node(id: "<stepId>") {
        ... on Step {
          ...VoteButton_step @arguments(isAuthenticated: $isAuthenticated)
        }
      }
      viewer: node(id: "<viewerId>") {
        ... on User {
          ...VoteButton_viewer @arguments(stepId: "<stepId>")
        }
      }
    }
  `

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = () => {
      const data = useLazyLoadQuery<VoteButtonTestQuery>(query, { isAuthenticated: true })

      if (data) {
        return (
          <VoteButton
            proposal={data.proposal}
            step={data.step}
            viewer={data.viewer}
            stepId="<stepId>"
            proposalId="<proposalId>"
            disabled={false}
          />
        )
      }

      return null
    }

    TestVoteButton = () => (
      <RelaySuspensFragmentTest environment={environment}>
        <MockProviders useCapUIProvider store={{ user: { user: { id: '<viewerId>' } } }}>
          <TestRenderer />
        </MockProviders>
      </RelaySuspensFragmentTest>
    )
  })

  afterEach(() => {
    clearSupportForPortals()
  })

  it('should render a vote button when no requirements', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        Node: () => ({
          id: '<stepId>',
          requirements: null,
          votesLimit: null,
          votesMin: null,
        }),
        Proposal: () => ({
          id: '<proposalId>',
        }),
        User: () => ({
          id: '<userId>',
        }),
      }),
    )
    testComponentTree = ReactTestRenderer.create(<TestVoteButton />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('should render a modal disclosure when requirements not met', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        Node: () => ({
          id: '<stepId>',
          requirements: { edges: [{ node: { viewerMeetsTheRequirement: false } }] },
          votesLimit: null,
          votesMin: null,
        }),
        Proposal: () => ({
          id: '<proposalId>',
        }),
        User: () => ({
          id: '<userId>',
        }),
      }),
    )
    testComponentTree = ReactTestRenderer.create(<TestVoteButton />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
