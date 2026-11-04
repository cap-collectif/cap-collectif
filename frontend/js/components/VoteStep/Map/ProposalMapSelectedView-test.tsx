import * as React from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import type { ProposalMapSelectedViewTestQuery } from '~relay/ProposalMapSelectedViewTestQuery.graphql'
import MockProviders, { RelaySuspensFragmentTest, enableFeatureFlags } from '~/testUtils'
import ProposalMapSelectedView from './ProposalMapSelectedView'

/**
 * @jest-status compliant
 * @jest-reason Checks proposal text and author avatars in the DOM with explicit Relay responses.
 */
describe('<ProposalMapSelectedView />', () => {
  let container: HTMLDivElement
  let root: Root
  const reactTestEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
  let originalActEnvironment: boolean | undefined
  const featureFlagMock = (globalThis as typeof globalThis & { mockFeatureFlag: jest.Mock }).mockFeatureFlag
  let originalFeatureFlagImplementation: ReturnType<typeof featureFlagMock.getMockImplementation>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    originalActEnvironment = reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT
    reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true
    root = createRoot(container)
    originalFeatureFlagImplementation = featureFlagMock.getMockImplementation()
    enableFeatureFlags(['profiles'])
  })

  afterEach(() => {
    try {
      act(() => root.unmount())
    } finally {
      container.remove()
      featureFlagMock.mockImplementation(originalFeatureFlagImplementation)
      if (originalActEnvironment === undefined) {
        delete reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT
      } else {
        reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment
      }
    }
  })

  let environment: any
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

  test.each([
    ['User', 'Jane Doe', '/jane.jpg'],
    ['User', 'Profil anonymisé', '/svg/anonymized-profile.svg'],
    ['Organization', 'Collective', '/collective.png'],
  ])('shows the name and avatar of %s %s', async (type, name, avatarUrl) => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        Proposal: () => ({
          id: '<proposalId>',
          title: 'Votez pour vos projets favoris',
          summaryOrBodyExcerpt: 'Lorem ipsum',
          url: '/proposal/default',
          slug: 'votez-pour-vos-projets',
          author: { __typename: type, displayName: name, username: name, avatarUrl },
        }),
      }),
    )
    await act(async () => {
      root.render(<TestProposalMapSelectedView />)
    })
    expect(container.textContent).toContain('Votez pour vos projets favoris')
    expect(container.textContent).toContain(name)
    expect(container.querySelector(`img[alt="${name}"]`)?.getAttribute('src')).toBe(avatarUrl)
  })
})
