/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EventPageRemoteContent } from './EventPageRemoteContent';
import { $fragmentRefs, $refType } from '~/mocks';

const baseRemoteEvent = {
  $fragmentRefs,
  $refType,
  id: '123id',
  title: 'Je suis un événement',
  jitsiToken: null,
  roomName: null,
  timeRange: {
    startAt: null,
    endAt: null,
  },
};

const presentialEvent = {
  remote: {
    ...baseRemoteEvent,
    timeRange: {
      ...baseRemoteEvent.timeRange,
      startAt: '1996-11-28T08:00:00+0200',
    },
  },
  remoteLive: {
    ...baseRemoteEvent,
    timeRange: {
      startAt: '1996-11-28T08:00:00+0200',
      endAt: '2022-11-28T08:00:00+0200',
    },
  },
};

const user = {
  $refType,
  username: 'Jpec',
};

describe('<EventPageRemoteContent />', () => {
  it('should render correctly when remote event', () => {
    const wrapper = shallow(
      <EventPageRemoteContent event={presentialEvent.remote} viewer={user} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when remote live event', () => {
    const wrapper = shallow(
      <EventPageRemoteContent event={presentialEvent.remoteLive} viewer={user} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
