import { Suspense } from 'react'
import { render, screen } from '@testing-library/react'
import { CapUIProvider, extendTheme } from '@cap-collectif/ui'
import { IntlProvider } from 'react-intl'
import { graphql, RelayEnvironmentProvider, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { VoteStepProposalsListMobileTestQuery } from '@relay/VoteStepProposalsListMobileTestQuery.graphql'
import VoteStepProposalsList from './VoteStepProposalsList'

const originalMatchMedia = window.matchMedia

jest.mock('nuqs', () => ({
  parseAsInteger: {},
  useQueryState: (name, options) => [
    new URLSearchParams(window.location.search).get(name) ?? options?.defaultValue ?? null,
  ],
}))

const QUERY = graphql`
  query VoteStepProposalsListMobileTestQuery($stepId: ID!, $isAuthenticated: Boolean!) @relay_test_operation {
    node(id: $stepId) {
      ... on CollectStep {
        ...VoteStepProposalsList_proposalStep @arguments(count: 10, isAuthenticated: $isAuthenticated)
      }
    }
  }
`

const TestList = () => {
  const data = useLazyLoadQuery<VoteStepProposalsListMobileTestQuery>(QUERY, {
    stepId: 'step',
    isAuthenticated: false,
  })
  return data.node ? (
    <VoteStepProposalsList
      step={data.node}
      templateColumns={{ base: '1fr', tablet: 'repeat(3, 1fr)', desktop: 'repeat(3, 1fr)' }}
      triggerRequirementModal={jest.fn()}
      selectedId={null}
      onSelectedIdChange={jest.fn()}
    />
  ) : null
}

const renderList = (mobile: boolean, search: string, statusColor?: 'INFO' | 'PRIMARY') => {
  window.history.replaceState({}, '', `/${search}`)
  window.matchMedia = jest.fn(query => ({
    ...originalMatchMedia(query),
    matches: mobile && query.includes('max-width: 767px'),
  }))
  const environment = createMockEnvironment()
  environment.mock.queueOperationResolver(operation =>
    MockPayloadGenerator.generate(operation, {
      Query: () => ({
        node: {
          __typename: 'CollectStep',
          id: 'step',
          mainView: 'LIST',
          votable: false,
          budget: null,
          votesRanking: false,
          defaultSort: 'RANDOM',
          proposals: {
            edges: [
              {
                node: {
                  id: 'proposal',
                  title: 'Community garden',
                  url: '/proposals/community-garden',
                  media: { url: '/garden.jpg' },
                  category: null,
                  author: null,
                  status: statusColor ? { name: 'Under review', color: statusColor } : null,
                  form: { usingIllustration: false },
                },
              },
            ],
          },
        },
      }),
    }),
  )
  return render(
    <CapUIProvider theme={extendTheme({ colors: { primary: { lighter: '#ffe6e6', darker: '#6b0000' } } })}>
      <IntlProvider locale="en">
        <RelayEnvironmentProvider environment={environment}>
          <Suspense fallback="Loading proposals">
            <TestList />
          </Suspense>
        </RelayEnvironmentProvider>
      </IntlProvider>
    </CapUIProvider>,
  )
}

/**
 * @jest-status compliant
 * @jest-reason Verifies the visible card cover with real Relay and CapUI; URL reads are simulated at the nuqs boundary.
 */
describe('Proposal list on mobile', () => {
  const initialUrl = window.location.href
  afterEach(() => {
    window.matchMedia = originalMatchMedia
    window.history.replaceState({}, '', initialUrl)
  })

  it.each(['', '?list_view=list'])('shows thumbnails for a list-default step on mobile with URL %s', async search => {
    renderList(true, search)
    expect(await screen.findByRole('link', { name: 'Community garden' })).not.toBeNull()
    expect(screen.getByAltText('').getAttribute('src')).toBe('/garden.jpg')
  })

  it('keeps the list format on desktop', async () => {
    renderList(false, '')
    expect(await screen.findByRole('link', { name: 'Community garden' })).not.toBeNull()
    expect(screen.queryByAltText('')).toBeNull()
  })

  it('keeps an INFO status blue on a platform with a red primary color', async () => {
    renderList(true, '', 'INFO')
    const status = await screen.findByLabelText('Tag Under review')
    expect(window.getComputedStyle(status).backgroundColor).toBe('rgb(224, 239, 255)')
    expect(window.getComputedStyle(status).color).toBe('rgb(0, 54, 112)')
  })

  it('keeps a PRIMARY status in the platform primary color', async () => {
    renderList(true, '', 'PRIMARY')
    const status = await screen.findByLabelText('Tag Under review')
    expect(window.getComputedStyle(status).backgroundColor).toBe('rgb(255, 230, 230)')
    expect(window.getComputedStyle(status).color).toBe('rgb(107, 0, 0)')
  })
})
