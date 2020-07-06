/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ParticipantList } from './ParticipantList';
import { $refType, $fragmentRefs } from '~/mocks';

const baseEvent = {
  $refType,
  id: '123454321',
  viewerDidAuthor: false,
  participants: {
    totalCount: 1,
    edges: [
      {
        registeredAnonymously: false,
        node: {
          $fragmentRefs,
        },
      },
    ],
  },
};

const event = {
  basic: baseEvent,
  withViewerDidAuthor: {
    ...baseEvent,
    viewerDidAuthor: true,
  },
  registeredAnonymously: {
    ...baseEvent,
    participants: {
      totalCount: 1,
      edges: [
        {
          registeredAnonymously: true,
          node: {
            $fragmentRefs,
          },
        },
      ],
    },
  },
};

describe('<ParticipantList />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <ParticipantList event={event.basic} setShowModalParticipant={jest.fn()} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when super admin', () => {
    const wrapper = shallow(
      <ParticipantList event={event.basic} setShowModalParticipant={jest.fn()} isSuperAdmin />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when viewerDidAuthor', () => {
    const wrapper = shallow(
      <ParticipantList event={event.withViewerDidAuthor} setShowModalParticipant={jest.fn()} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when registeredAnonymously', () => {
    const wrapper = shallow(
      <ParticipantList event={event.registeredAnonymously} setShowModalParticipant={jest.fn()} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
