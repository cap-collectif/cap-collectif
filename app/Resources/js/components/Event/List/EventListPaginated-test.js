// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EventListPaginated } from './EventListPaginated';
import { relayPaginationMock, $refType, $fragmentRefs } from '../../../mocks';
import { features } from '../../../redux/modules/default';

const emptyConnection = {
  totalCount: 0,
  edges: [],
  pageInfo: {
    hasPreviousPage: false,
    hasNextPage: false,
    startCursor: null,
    endCursor: null,
  },
};

const props = {
  query: {
    $refType,
    $fragmentRefs,
    previewPassedEvents: {
      totalCount: 0,
    },
    events: {
      totalCount: 3,
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: true,
        startCursor: null,
        endCursor: null,
      },
      edges: [
        {
          node: {
            $fragmentRefs,
            id: 'event1',
          },
        },
        {
          node: { $fragmentRefs, id: 'event2' },
        },
        {
          node: { $fragmentRefs, id: 'event3' },
        },
      ],
    },
  },
  relay: relayPaginationMock,
  eventSelected: null,
  status: 'all',
  isMobileListView: false,
  dispatch: jest.fn(),
  features: {
    ...features,
    themes: true,
    projects_form: true,
    display_map: true,
  },
};

describe('<EventListPaginated />', () => {
  it('renders correctly when status all', () => {
    const wrapper = shallow(<EventListPaginated {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders a preview of passed events when status future and no future events', () => {
    const wrapper = shallow(
      <EventListPaginated
        {...props}
        query={{ ...props.query, events: emptyConnection, previewPassedEvents: { totalCount: 10 } }}
        status="ongoing-and-future"
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when status future and no future events and no passed events', () => {
    const wrapper = shallow(
      <EventListPaginated
        {...props}
        query={{ ...props.query, events: emptyConnection, previewPassedEvents: { totalCount: 0 } }}
        status="ongoing-and-future"
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when status future and no future events and no passed events and previewPassedEvents is null', () => {
    const wrapper = shallow(
      <EventListPaginated
        {...props}
        query={{ ...props.query, events: emptyConnection, previewPassedEvents: { totalCount: 0 } }}
        status="ongoing-and-future"
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
