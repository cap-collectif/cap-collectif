/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectEventPreview } from './ProjectEventPreview';
import { $refType, $fragmentRefs } from '~/mocks';

const baseEvent = {
  $refType,
  id: 'eventId',
  isRecordingPublished: false,
  title: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
  url: '#',
  isPresential: true,
  animator: null,
  author: null,
  guestListEnabled: false,
  timeRange: {
    startAt: '2030-03-10 00:00:00',
    endAt: '2030-03-11 00:00:00',
  },
  googleMapsAddress: {
    __typename: 'GoogleMapsAddress',
    $fragmentRefs,
  },
};

const event = {
  basic: baseEvent,
  remote: {
    ...baseEvent,
    isPresential: false,
  },
  withoutAddress: {
    ...baseEvent,
    googleMapsAddress: null,
  },
  withoutDate: {
    ...baseEvent,
    timeRange: {
      startAt: null,
      endAt: null,
    },
  },
  withGuestEnabled: {
    ...baseEvent,
    guestListEnabled: true,
  },
  withRecording: {
    ...baseEvent,
    isPresential: false,
    isRecordingPublished: true,
  },
};

describe('<ProjectEventPreview />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProjectEventPreview event={event.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly for remote event', () => {
    const wrapper = shallow(<ProjectEventPreview event={event.remote} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no googleMapsAddress', () => {
    const wrapper = shallow(<ProjectEventPreview event={event.withoutAddress} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no date', () => {
    const wrapper = shallow(<ProjectEventPreview event={event.withoutDate} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when guest enabled', () => {
    const wrapper = shallow(<ProjectEventPreview event={event.withGuestEnabled} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when when recording published', () => {
    const wrapper = shallow(<ProjectEventPreview event={event.withRecording} />);
    expect(wrapper).toMatchSnapshot();
  });
});
