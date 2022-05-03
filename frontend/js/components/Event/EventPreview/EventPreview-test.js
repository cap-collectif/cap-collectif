/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EventPreview } from './EventPreview';
import { $fragmentRefs, $refType } from '~/mocks';

const baseEvent = {
  $fragmentRefs,
  $refType,
  title: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
  url: '#',
  guestListEnabled: false,
  timeRange: {
    startAt: '2030-03-10 00:00:00',
    endAt: null,
    isFuture: true,
  },
  steps: [{ __typename: 'CollectStep', $fragmentRefs }],
  googleMapsAddress: {
    __typename: 'GoogleMapsAddress',
    $fragmentRefs,
  },
  themes: [{ __typename: 'Theme', $fragmentRefs }],
  author: {
    $fragmentRefs,
  },
  maxRegistrations: null,
  isRegistrationPossible: true,
  isMeasurable: false,
  isCompleteAndRegistrationPossibleResolver: false,
  availableRegistration: 0,
};

const event = {
  basic: {
    ...baseEvent,
  },
  withoutAddress: {
    ...baseEvent,
    googleMapsAddress: null,
  },
  withoutThemes: {
    ...baseEvent,
    themes: [],
  },
  withoutDate: {
    ...baseEvent,
    timeRange: {
      startAt: null,
      endAt: null,
      isFuture: false,
    },
  },
  withGuestEnabled: {
    ...baseEvent,
    guestListEnabled: true,
  },
  withCompleteTag: {
    ...baseEvent,
    guestListEnabled: true,
    maxRegistrations: 3,
    isMeasurable: false,
    isCompleteAndRegistrationPossibleResolver: true,
    availableRegistration: 0,
  },
  withRegisterTag: {
    ...baseEvent,
    guestListEnabled: true,
    maxRegistrations: 3,
    isMeasurable: false,
    isCompleteAndRegistrationPossibleResolver: false,
    availableRegistration: 0,
    isViewerParticipatingAtEvent: true,
  },
  withRestTag: {
    ...baseEvent,
    guestListEnabled: true,
    maxRegistrations: 10,
    isMeasurable: false,
    isCompleteAndRegistrationPossibleResolver: false,
    availableRegistration: 3,
    isViewerParticipatingAtEvent: true,
  },
};

describe('<EventPreview />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<EventPreview event={event.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render  when illustration not displayed', () => {
    const wrapper = shallow(<EventPreview event={event.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no googleMapsAddress', () => {
    const wrapper = shallow(<EventPreview event={event.withoutAddress} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no themes', () => {
    const wrapper = shallow(<EventPreview event={event.withoutThemes} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no date', () => {
    const wrapper = shallow(<EventPreview event={event.withoutDate} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when guest enabled', () => {
    const wrapper = shallow(<EventPreview event={event.withGuestEnabled} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly when guest enabled and tag complete', () => {
    const wrapper = shallow(<EventPreview event={event.withCompleteTag} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly when guest enabled and tag register', () => {
    const wrapper = shallow(<EventPreview event={event.withRegisterTag} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly when guest enabled and tag rest', () => {
    const wrapper = shallow(<EventPreview event={event.withRestTag} />);
    expect(wrapper).toMatchSnapshot();
  });
});
