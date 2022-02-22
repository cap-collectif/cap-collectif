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
    },
  },
  withGuestEnabled: {
    ...baseEvent,
    guestListEnabled: true,
  },
};

describe('<EventPreview />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<EventPreview event={event.basic} hasIllustrationDisplayed />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render  when illustration not displayed', () => {
    const wrapper = shallow(<EventPreview event={event.basic} hasIllustrationDisplayed={false} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no googleMapsAddress', () => {
    const wrapper = shallow(<EventPreview event={event.withoutAddress} hasIllustrationDisplayed />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no themes', () => {
    const wrapper = shallow(<EventPreview event={event.withoutThemes} hasIllustrationDisplayed />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no date', () => {
    const wrapper = shallow(<EventPreview event={event.withoutDate} hasIllustrationDisplayed />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when guest enabled', () => {
    const wrapper = shallow(
      <EventPreview event={event.withGuestEnabled} hasIllustrationDisplayed />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
