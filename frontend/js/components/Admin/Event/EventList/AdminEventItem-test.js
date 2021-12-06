// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import AdminEventItem from '~/components/Admin/Event/EventList/AdminEventItem';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import type { AdminEventItemTestQuery } from '~relay/AdminEventItemTestQuery.graphql';

describe('<AdminEventItem />', () => {
  let environment;
  let TestComponent;

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
      exportParticipantsUrl: 'https://capco.dev/export-event-participants/event3?_locale=fr-FR',
      __typename: 'Event',
    }),
  };
  const query = graphql`
    query AdminEventItemTestQuery($id: ID = "<default>") @relay_test_operation {
      event: node(id: $id) {
        ...AdminEventItem_event
      }
    }
  `;
  afterEach(() => {
    clearSupportForPortals();
  });

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {
      id: 'RXZlbnQ6ZXZlbnQz',
    };
    const TestRenderer = props => {
      const data = useLazyLoadQuery<AdminEventItemTestQuery>(query, queryVariables);
      if (!data.event) return null;
      return <AdminEventItem event={data.event} isAdmin {...props} affiliations={null} />;
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

  it('should render correctly', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with deleted event', () => {
    ReactTestRenderer.act(() => {
      environment.mock.queueOperationResolver(operation =>
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
            __typename: 'Event',
          }),
        }),
      );
    });

    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });
});
