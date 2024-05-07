import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import type { ProposalMapSelectedViewTestQuery } from '~relay/ProposalMapSelectedViewTestQuery.graphql'
import MockProviders, { RelaySuspensFragmentTest, addsSupportForPortals, clearSupportForPortals } from '~/testUtils'
import ProposalMapSelectedView from './ProposalMapSelectedView'

describe('<ProposalMapSelectedView />', () => {
  let environment: any
  let testComponentTree: any
  let TestProposalMapSelectedView: any
  const query = graphql`
    query ProposalMapSelectedViewTestQuery($isAuthenticated: Boolean!) @relay_test_operation {
      proposal: node(id: "<proposalId>") {
        ... on Proposal {
          ...ProposalMapSelectedView_proposal @arguments(stepId: "<stepId>", isAuthenticated: $isAuthenticated)
        }
      }
      step: node(id: "<stepId>") {
        ... on Step {
          ...ProposalMapSelectedView_step @arguments(isAuthenticated: $isAuthenticated)
        }
      }
      viewer: node(id: "<viewerId>") {
        ... on User {
          ...ProposalMapSelectedView_viewer @arguments(stepId: "<stepId>")
        }
      }
    }
  `
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = () => {
      const data = useLazyLoadQuery<ProposalMapSelectedViewTestQuery>(query, { isAuthenticated: true })

      if (data && data.proposal) {
        return (
          <ProposalMapSelectedView
            proposal={data.proposal}
            step={data.step}
            viewer={data.viewer}
            onClose={jest.fn()}
            stepId="<stepId>"
            disabled={false}
          />
        )
      }

      return null
    }

    TestProposalMapSelectedView = () => (
      <MockProviders useCapUIProvider store={{ user: { user: { id: '<viewerId>' } } }}>
        <RelaySuspensFragmentTest environment={environment}>
          <TestRenderer />
        </RelaySuspensFragmentTest>
      </MockProviders>
    )
  })

  afterEach(() => {
    clearSupportForPortals()
  })

  describe('<TestProposalMapSelectedView />', () => {
    it('should render correctly', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, {
          Proposal: () => ({
            id: '<proposalId>',
            title: 'Votez pour vos projets favoris',
            summaryOrBodyExcerpt: 'Lorem ipsum',
            url: '/proposal/default',
            slug: 'votez-pour-vos-projets',
            author: {
              displayName: 'Jane Doe',
              media: {
                url: 'profile_pic.jpg',
              },
            },
          }),
        }),
      )
      testComponentTree = ReactTestRenderer.create(<TestProposalMapSelectedView />)
      expect(testComponentTree).toMatchSnapshot()
    })
  })
})
