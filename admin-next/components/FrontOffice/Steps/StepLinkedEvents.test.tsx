import { Suspense } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { CapUIProvider } from '@cap-collectif/ui'
import { IntlProvider } from 'react-intl'
import { graphql, RelayEnvironmentProvider, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { StepLinkedEventsTestQuery } from '@relay/StepLinkedEventsTestQuery.graphql'
import StepLinkedEvents from './StepLinkedEvents'

// Carousel geometry requires browser validation; this double identifies when the carousel is used.
jest.mock('react-slick', () => ({
  __esModule: true,
  default: require('react').forwardRef(({ children }, ref) => (
    <div role="group" aria-label="Event carousel">
      {children}
    </div>
  )),
}))

const originalMatchMedia = window.matchMedia
const QUERY = graphql`
  query StepLinkedEventsTestQuery @relay_test_operation {
    node(id: "step") {
      ... on CollectStep {
        ...StepLinkedEvents_step
      }
    }
  }
`
const TestEvents = () => {
  const data = useLazyLoadQuery<StepLinkedEventsTestQuery>(QUERY, {})
  return data.node ? <StepLinkedEvents step={data.node} /> : null
}

const renderEvents = (mobile = false, addressJson = '[]', empty = false, futureCount = 1) => {
  window.matchMedia = jest.fn(query => ({
    ...originalMatchMedia(query),
    matches: mobile && query.includes('max-width: 767px'),
  }))
  const environment = createMockEnvironment()
  const event = (id: string, title: string) => ({
    node: {
      id,
      title,
      url: `/events/${id}`,
      timeRange: { startAt: '2026-10-27 10:00:00', endAt: null },
      media: { url: '/event.jpg' },
      themes: [{ id: 'theme', title: 'Environment' }],
      guestListEnabled: true,
      googleMapsAddress: { formatted: '10 rue du Jardin, Paris', json: addressJson },
    },
  })
  environment.mock.queueOperationResolver(operation =>
    MockPayloadGenerator.generate(operation, {
      Query: () => ({
        node: {
          __typename: 'CollectStep',
          futureEvents: {
            totalCount: empty ? 0 : futureCount,
            edges: empty
              ? []
              : Array.from({ length: futureCount }, (_, index) =>
                  event(`future-${index}`, index === 0 ? 'Upcoming workshop' : 'Another workshop'),
                ),
          },
          pastEvents: { totalCount: empty ? 0 : 1, edges: empty ? [] : [event('past', 'Previous workshop')] },
        },
      }),
    }),
  )
  render(
    <CapUIProvider>
      <IntlProvider
        locale="en"
        messages={{
          'global.events': 'Events',
          'front.step.linked-events.count': '{num} Events',
          'front.step.linked-events.future-count': '{num} Upcoming',
          'front.step.linked-events.past-count': '{num} Past',
          'theme.show.status.future': 'Upcoming',
          finished: 'Past',
          'registration-required': 'Registration required',
          no_events_message: 'No events',
          'global.previous': 'Previous',
          'global.next': 'Next',
        }}
      >
        <RelayEnvironmentProvider environment={environment}>
          <Suspense fallback="Loading events">
            <TestEvents />
          </Suspense>
        </RelayEnvironmentProvider>
      </IntlProvider>
    </CapUIProvider>,
  )
}

/**
 * @jest-status compliant
 * @jest-reason Exercises the event content, filters and single-item carousel bypass; carousel geometry needs a browser.
 */
describe('StepLinkedEvents', () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('shows a single event without a carousel or navigation arrows', async () => {
    renderEvents()
    expect(await screen.findByRole('link', { name: 'Upcoming workshop' })).not.toBeNull()
    expect(screen.queryByRole('group', { name: 'Event carousel' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Previous' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull()
    expect(screen.queryByText(/Version [12]/)).toBeNull()
    expect(window.getComputedStyle(screen.getByRole('heading', { name: '1 Events' })).color).toBe('rgb(0, 0, 0)')
  })

  it('uses the carousel for several events and bypasses it when switching to a single past event', async () => {
    renderEvents(false, '[]', false, 2)
    const carousel = within(await screen.findByRole('group', { name: 'Event carousel' }))
    expect(carousel.getByRole('link', { name: 'Upcoming workshop' })).not.toBeNull()
    expect(carousel.getByRole('link', { name: 'Another workshop' })).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Upcoming' }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Past' }))
    expect(screen.getByRole('link', { name: 'Previous workshop' })).not.toBeNull()
    expect(screen.queryByRole('link', { name: 'Upcoming workshop' })).toBeNull()
    expect(screen.queryByRole('group', { name: 'Event carousel' })).toBeNull()
  })

  it('shows upcoming and past sections on mobile even with an invalid legacy address', async () => {
    renderEvents(true, 'invalid json')
    expect(await screen.findByRole('heading', { name: '1 Upcoming' })).not.toBeNull()
    expect(screen.getByRole('heading', { name: '1 Past' })).not.toBeNull()
    expect(screen.getByRole('link', { name: 'Upcoming workshop' })).not.toBeNull()
    expect(screen.getByRole('link', { name: 'Previous workshop' })).not.toBeNull()
    expect(screen.getAllByText('10 rue du Jardin, Paris')).toHaveLength(2)
  })

  it('hides the block when there are no linked events', () => {
    renderEvents(false, '[]', true)
    expect(screen.queryByRole('region', { name: 'Events' })).toBeNull()
  })
})
