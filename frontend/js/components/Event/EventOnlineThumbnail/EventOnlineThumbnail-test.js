// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EventOnlineThumbnail } from './EventOnlineThumbnail';
import { $refType } from '~/mocks';

const defaultProps = {
  joinRoom: jest.fn(),
  hasStarted: true,
  hasEnded: false,
  isJitsiJoined: false,
};

const event = {
  $refType,
  timeRange: {
    startAt: '2019-04-07 00:00:00',
  },
  viewerIsRoomAnimator: false,
  isRecordingPublished: false,
  recordingUrl: '<mocked-replay-url/>',
};

describe('<EventOnlineThumbnail />', () => {
  it('it renders correctly when not started', () => {
    const wrapper = shallow(
      <EventOnlineThumbnail
        {...defaultProps}
        hasStarted={false}
        event={{ ...event, timeRange: { startAt: '2022-04-07 00:00:00' } }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('it renders correctly when not started and animator', () => {
    const wrapper = shallow(
      <EventOnlineThumbnail
        {...defaultProps}
        hasStarted={false}
        event={{
          ...event,
          viewerIsRoomAnimator: true,
          timeRange: { startAt: '2022-04-07 00:00:00' },
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('it renders nothing when live and joined', () => {
    const wrapper = shallow(<EventOnlineThumbnail {...defaultProps} isJitsiJoined event={event} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('it renders nothing when live and not joined', () => {
    const wrapper = shallow(
      <EventOnlineThumbnail {...defaultProps} isJitsiJoined={false} event={event} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('it renders correctly when no replay is published', () => {
    const wrapper = shallow(
      <EventOnlineThumbnail
        {...defaultProps}
        hasEnded
        event={{
          ...event,
          timeRange: { startAt: '2018-04-07 00:00:00' },
          isRecordingPublished: false,
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('it renders correctly when replay is published', () => {
    const wrapper = shallow(
      <EventOnlineThumbnail
        {...defaultProps}
        hasEnded
        event={{ ...event, isRecordingPublished: true }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('it renders correctly when replay is published but the recording URL is empty', () => {
    const wrapper = shallow(
      <EventOnlineThumbnail
        {...defaultProps}
        hasEnded
        event={{ ...event, isRecordingPublished: true, recordingUrl: null }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
