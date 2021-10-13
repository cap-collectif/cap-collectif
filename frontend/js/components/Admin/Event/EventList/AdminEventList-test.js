// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import AdminEventList, {
  EVENT_LIST_PAGINATION,
} from '~/components/Admin/Event/EventList/AdminEventList';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import type { AdminEventListTestQuery } from '~relay/AdminEventListTestQuery.graphql';

describe('<AdminEventList />', () => {
  let environment;
  let TestComponent;

  const defaultMockResolvers = {
    User: () => ({
      events: {
        __id: 'client:VXNlcjp1c2VyQWRtaW4=:__AdminEventList_events_connection',
        totalCount: 27,
        edges: [
          {
            node: {
              id: 'RXZlbnQ6ZXZlbnQz',
              title: 'GrenobleWeb2015',
              adminUrl: 'https://capco.dev/admin/capco/app/event/event3/edit?_locale=fr-FR',
              reviewStatus: 'PUBLISHED',
              projects: [
                {
                  id: 'UHJvamVjdDpwcm9qZWN0MQ==',
                  title: 'Croissance, innovation, disruption',
                  url:
                    'https://capco.dev/consultation/croissance-innovation-disruption/presentation/presentation-1',
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
              exportParticipantsUrl:
                'https://capco.dev/export-event-participants/event3?_locale=fr-FR',
              __typename: 'Event',
            },
            cursor:
              'YTozOntpOjA7aToxOTcwNDMxMjAwMDAwO2k6MTtpOjIwNTc2MTI0MDAwMDA7aToyO2k6MTQyMDIzOTYwMDAwMDt9',
          },
          {
            node: {
              id: 'RXZlbnQ6ZXZlbnQx',
              owner: null,
              title: 'Event with registrations',
              adminUrl: 'https://capco.dev/admin/capco/app/event/event1/edit?_locale=fr-FR',
              reviewStatus: 'PUBLISHED',
              projects: [
                {
                  id: 'UHJvamVjdDpwcm9qZWN0MQ==',
                  title: 'Croissance, innovation, disruption',
                  url:
                    'https://capco.dev/consultation/croissance-innovation-disruption/presentation/presentation-1',
                },
              ],
              themes: [
                {
                  id: 'theme1',
                  title: 'Immobilier',
                  url: 'https://capco.dev/themes/immobilier?_locale=fr-FR',
                },
                {
                  id: 'theme2',
                  title: 'Justice',
                  url: 'https://capco.dev/themes/justice?_locale=fr-FR',
                },
              ],
              timeRange: {
                startAt: '2032-03-01 00:00:00',
                endAt: '2032-03-10 00:00:00',
              },
              createdAt: '2015-01-01 00:00:00',
              guestListEnabled: false,
              __typename: 'Event',
            },
            cursor:
              'YTozOntpOjA7aToxOTYxNzA4NDAwMDAwO2k6MTtpOjE5NjI0ODYwMDAwMDA7aToyO2k6MTQyMDA2NjgwMDAwMDt9',
          },
          {
            node: {
              id: 'RXZlbnQ6ZXZlbnQ2',
              owner: null,
              title: 'Event without registrations',
              adminUrl: 'https://capco.dev/admin/capco/app/event/event6/edit?_locale=fr-FR',
              reviewStatus: 'PUBLISHED',
              projects: [],
              themes: [],
              timeRange: {
                startAt: '2032-02-01 00:00:00',
                endAt: '2040-02-02 00:00:00',
              },
              createdAt: '2015-01-06 00:00:00',
              guestListEnabled: true,
              __typename: 'Event',
            },
            cursor:
              'YTozOntpOjA7aToxOTU5MjAyODAwMDAwO2k6MTtpOjIyMTE3NTAwMDAwMDA7aToyO2k6MTQyMDQ5ODgwMDAwMDt9',
          },
        ],
      },
    }),
  };
  const query = graphql`
    query AdminEventListTestQuery(
      $count: Int
      $cursor: String
      $term: String
      $affiliations: [EventAffiliation!]
      $orderBy: EventOrder
      $status: EventStatus
    ) @relay_test_operation {
      viewer {
        ...AdminEventList_viewer
          @arguments(
            count: $count
            cursor: $cursor
            term: $term
            affiliations: $affiliations
            orderBy: $orderBy
            status: $status
          )
      }
    }
  `;

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {
      count: EVENT_LIST_PAGINATION,
      cursor: null,
      term: null,
      status: null,
      affiliations: null,
      orderBy: { field: 'START_AT', direction: 'DESC' },
    };

    const TestRenderer = props => {
      const data = useLazyLoadQuery<AdminEventListTestQuery>(query, queryVariables);
      if (!data.viewer) return null;
      return (
        <AdminEventList
          viewer={data.viewer}
          isAdmin
          term=""
          resetFilters={jest.fn()}
          status="ALL"
          {...props}
        />
      );
    };
    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    );
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });
  afterEach(() => {
    clearSupportForPortals();
  });

  it('should render correctly', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });
});
