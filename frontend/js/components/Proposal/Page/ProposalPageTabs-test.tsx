/* eslint-env jest */
import * as React from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import ReactTestRenderer from 'react-test-renderer'
import {
  disableFeatureFlags,
  enableFeatureFlags,
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils'
import type { ProposalPageTabsTestQuery } from '~relay/ProposalPageTabsTestQuery.graphql'
import { ProposalPageTabs } from './ProposalPageTabs'

describe('<ProposalPageTabs />', () => {
  let environment
  let testComponentTree
  let TestProposalPageTabs
  const defaultMockResolvers = {
    Proposal: () => ({
      id: '1',
      allFollowers: {
        totalCount: 169,
      },
      news: {
        totalCount: 1,
        edges: [
          {
            node: {
              id: 'news1',
              title: 'Titre',
            },
          },
        ],
      },
      currentVotableStep: null,
      project: {
        opinionCanBeFollowed: true,
        type: {
          title: 'global.consultation',
        },
      },
      paperVotesTotalCount: 0,
    }),
    Step: () => ({
      canDisplayBallot: true,
    }),
  }
  const query = graphql`
    query ProposalPageTabsTestQuery($proposalId: ID = "proposalId", $stepId: ID = "stepId") @relay_test_operation {
      proposal: node(id: $proposalId) {
        ...ProposalPageTabs_proposal
      }
      step: node(id: $stepId) {
        ...ProposalPageTabs_step
      }
    }
  `
  afterEach(() => {
    disableFeatureFlags()
    clearSupportForPortals()
  })
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = props => {
      const data = useLazyLoadQuery<ProposalPageTabsTestQuery>(query, {})
      if (!data.proposal || !data.step) return null
      return <ProposalPageTabs proposal={data.proposal} step={data.step} {...props} />
    }

    TestProposalPageTabs = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} v />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  it('should render Tabs with correct DOM structure', () => {
    enableFeatureFlags(['districts'])
    enableFeatureFlags(['themes'])
    testComponentTree = ReactTestRenderer.create(<TestProposalPageTabs votesCount={5} tabKey="content" />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('should render without blog tab', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        Proposal: () => ({
          id: '1',
          allFollowers: {
            totalCount: 169,
          },
          currentVotableStep: null,
          votableSteps: [],
          news: {
            totalCount: 0,
            edges: [],
          },
          project: {
            opinionCanBeFollowed: true,
            type: {
              title: 'global.consultation',
            },
          },
          form: {
            usingThemes: true,
            usingCategories: true,
            objectType: 'PROPOSAL',
          },
        }),
      }),
    )
    testComponentTree = ReactTestRenderer.create(<TestProposalPageTabs votesCount={5} tabKey="content" />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('should render without vote tab', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        Step: () => ({
          canDisplayBallot: false,
        }),
      }),
    )
    testComponentTree = ReactTestRenderer.create(<TestProposalPageTabs votesCount={5} tabKey="content" />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
