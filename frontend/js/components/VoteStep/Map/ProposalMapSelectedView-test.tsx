import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import type { ProposalMapSelectedViewTestQuery } from '~relay/ProposalMapSelectedViewTestQuery.graphql'
import MockProviders, { RelaySuspensFragmentTest } from '~/testUtils'
import ProposalMapSelectedView from './ProposalMapSelectedView'

describe('<ProposalMapSelectedView />', () => {
  let environment: any
  let testComponentTree: any
  let TestProposalMapSelectedView: any
  const query = graphql`
    query ProposalMapSelectedViewTestQuery @relay_test_operation {
      proposal: node(id: "<default>") {
        ... on Proposal {
          ...ProposalMapSelectedView_proposal
        }
      }
    }
  `
  beforeEach(() => {
    environment = createMockEnvironment()

    const TestRenderer = () => {
      const data = useLazyLoadQuery<ProposalMapSelectedViewTestQuery>(query, {})

      if (data && data.proposal) {
        return (
          <ProposalMapSelectedView proposal={data.proposal} onClose={jest.fn()} stepId="<stepId>" disabled={false} />
        )
      }

      return null
    }

    TestProposalMapSelectedView = () => (
      <MockProviders store={{}} useCapUIProvider>
        <RelaySuspensFragmentTest environment={environment}>
          <TestRenderer />
        </RelaySuspensFragmentTest>
      </MockProviders>
    )
  })
  describe('<TestProposalMapSelectedView />', () => {
    it('should render correctly', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, {
          Node: () => ({
            id: '<default>',
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
