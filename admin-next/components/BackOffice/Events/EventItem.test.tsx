/* eslint-env jest */
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import EventItem from './EventItem'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from 'tests/testUtils'
import type { EventItemTestQuery } from '@relay/EventItemTestQuery.graphql'
import { act, render } from '@testing-library/react'

describe('<EventItem />', () => {
  let environment: any
  let TestComponent: any

  const defaultMockResolvers = {
    Event: () => ({
      id: 'RXZlbnQ6ZXZlbnQz',
      title: 'GrenobleWeb2015',
      adminUrl: 'https://capco.dev/admin/capco/app/event/event3/edit?_locale=fr-FR',
      reviewStatus: 'PUBLISHED',
      projects: [
        {
          id: 'UHJvamVjdDpwcm9qZWN0MQ==',
          title: 'Croissance, innovation, disruption',
          url: 'https://capco.dev/consultation/croissance-innovation-disruption/presentation/presentation-1',
        },
      ],
      themes: [],
      timeRange: {
        startAt: '2032-06-10 00:00:00',
        endAt: '2035-03-16 00:00:00',
      },
      createdAt: '2015-01-03 00:00:00',
      owner: null,
      guestListEnabled: true,
      exportParticipantsUrl: 'https://capco.dev/export-event-participants/event3?_locale=fr-FR',
      __typename: 'Event',
    }),
  }
  const query = graphql`
    query EventItemTestQuery($id: ID = "<default>") @relay_test_operation {
      event: node(id: $id) {
        ...EventItem_event
      }
      viewer {
        ...EventItem_viewer
      }
    }
  `
  afterEach(() => {
    clearSupportForPortals()
  })

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    const queryVariables = {
      id: 'RXZlbnQ6ZXZlbnQz',
    }
    const TestRenderer = (props: any) => {
      const data = useLazyLoadQuery<EventItemTestQuery>(query, queryVariables)
      if (!data.event || !data.viewer) return null
      return <EventItem event={data.event} viewer={data.viewer} {...props} affiliations={null} />
    }
    TestComponent = (props: any) => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )
    environment.mock.queueOperationResolver((operation: any) =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    )
  })

  it('should render correctly', () => {
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with deleted event', () => {
    act(() => {
      environment.mock.queueOperationResolver((operation: any) =>
        MockPayloadGenerator.generate(operation, {
          ...defaultMockResolvers,
          Event: () => ({
            id: 'RXZlbnQ6ZXZlbnQz',
            owner: null,
            title: 'TESTEVENT',
            reviewStatus: 'DELETED',
            adminUrl: 'https://capco.dev/admin/capco/app/event/event3/edit?_locale=fr-FR',
            projects: [
              {
                id: 'UHJvamVjdDpwcm9qZWN0MQ==',
                title: 'Croissance, innovation, disruption',
                url: 'https://capco.dev/consultation/croissance-innovation-disruption/presentation/presentation-1',
              },
            ],
            themes: [],
            timeRange: {
              startAt: '2032-06-10 00:00:00',
              endAt: '2035-03-16 00:00:00',
            },
            createdAt: '2015-01-03 00:00:00',
            __typename: 'Event',
          }),
          User: () => ({
            isAdmin: false,
            isAdminOrganization: false,
            isOnlyProjectAdmin: false,
            isSuperAdmin: false,
            organizations: null,
          }),
        }),
      )
    })

    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
})
