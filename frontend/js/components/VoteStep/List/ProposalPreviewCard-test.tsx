import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import type { ProposalPreviewCardTestQuery } from '~relay/ProposalPreviewCardTestQuery.graphql'
import MockProviders, { RelaySuspensFragmentTest, addsSupportForPortals, clearSupportForPortals } from '~/testUtils'
import ProposalPreviewCard from './ProposalPreviewCard'

describe('<ProposalPreviewCard />', () => {
  let environment: any
  let testComponentTree: any
  let TestProposalPreviewCard: any
  const query = graphql`
    query ProposalPreviewCardTestQuery($isAuthenticated: Boolean!) @relay_test_operation {
      proposal: node(id: "<proposalId>") {
        ... on Proposal {
          ...ProposalPreviewCard_proposal @arguments(stepId: "<stepId>", isAuthenticated: false)
        }
      }
      step: node(id: "<stepId>") {
        ... on Step {
          ...ProposalPreviewCard_step @arguments(isAuthenticated: $isAuthenticated)
        }
      }
      viewer: node(id: "<viewerId>") {
        ... on User {
          ...ProposalPreviewCard_viewer @arguments(stepId: "<stepId>")
        }
      }
    }
  `
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = () => {
      const data = useLazyLoadQuery<ProposalPreviewCardTestQuery>(query, { isAuthenticated: true })

      if (data) {
        return (
          <ProposalPreviewCard
            proposal={data.proposal}
            step={data.step}
            viewer={data.viewer}
            fullSize={false}
            stepId="<stepId>"
            disabled={false}
          />
        )
      }

      return null
    }

    TestProposalPreviewCard = () => (
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

  describe('<TestProposalPreviewCard />', () => {
    it('should render correctly', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, {
          Node: () => ({
            title: "Installation d'une serre dans le Jardin partagé du Val des Oiseaux - Argenteuil",
            url: 'installation-serre-jardin-argenteuil',
            summaryOrBodyExcerpt: 'En accord avec la municipalité...',
            author: {
              displayName: 'Jane Doe',
              media: {
                url: 'profile-pic.jpg',
              },
            },
            comments: {
              totalCount: 50,
            },
            votes: {
              totalCount: 400,
            },
            status: {
              name: 'En cours',
            },
          }),
        }),
      )
      testComponentTree = ReactTestRenderer.create(<TestProposalPreviewCard />)
      expect(testComponentTree).toMatchSnapshot()
    })
  })
})
