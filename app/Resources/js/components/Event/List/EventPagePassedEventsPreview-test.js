// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EventPagePassedEventsPreview } from './EventPagePassedEventsPreview';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<EventPagePassedEventsPreviews />', () => {
  const props = {
    dispatch: jest.fn(),
    query: {
      $refType,
      previewPassedEvents: {
        totalCount: 3,
        edges: [
          { node: { id: 'event1', $fragmentRefs } },
          { node: { id: 'event2', $fragmentRefs } },
          { node: { id: 'event3', $fragmentRefs } },
        ],
      },
    },
  };

  it('renders correctly when empty', () => {
    const emptyQuery = {
      $refType,
      previewPassedEvents: {
        totalCount: 0,
        edges: [],
      },
    };
    const wrapper = shallow(<EventPagePassedEventsPreview {...props} query={emptyQuery} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<EventPagePassedEventsPreview {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
