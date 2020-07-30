/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EventPageContent } from './EventPageContent';
import { $fragmentRefs, $refType } from '~/mocks';

const basePresentialEvent = {
  $fragmentRefs,
  $refType,
  id: '123id',
  title: 'Je suis un événement',
  url: 'https://jesuislurl.com',
  body: 'je suis le body',
  commentable: true,
  isPresential: true,
  isRegistrationPossible: true,
  isViewerParticipatingAtEvent: true,
  media: {
    url: 'https://uneimagerandom.jpg',
  },
  googleMapsAddress: {
    lat: 1234321,
    lng: 123454321,
  },
  participants: {
    totalCount: 1,
  },
};

const presentialEvent = {
  basic: {
    ...basePresentialEvent,
  },
  noCommentable: {
    ...basePresentialEvent,
    commentable: false,
  },
  noRegistrationPossible: {
    ...basePresentialEvent,
    isRegistrationPossible: false,
  },
  noGoogleAddress: {
    ...basePresentialEvent,
    googleMapsAddress: null,
  },
  withModerationMotive: {
    ...basePresentialEvent,
    viewerDidAuthor: true,
  },
  remote: {
    ...basePresentialEvent,
    isPresential: false,
  },
};

const user = {
  $fragmentRefs,
  $refType,
  id: 'jpecId',
};

describe('<EventPageContent />', () => {
  it('should render correctly when type physical', () => {
    const wrapper = shallow(
      <EventPageContent
        hasProposeEventEnabled={false}
        event={presentialEvent.basic}
        viewer={user}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no commentable', () => {
    const wrapper = shallow(
      <EventPageContent
        hasProposeEventEnabled={false}
        event={presentialEvent.noCommentable}
        viewer={user}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no registration possible', () => {
    const wrapper = shallow(
      <EventPageContent
        hasProposeEventEnabled={false}
        event={presentialEvent.noRegistrationPossible}
        viewer={user}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no google address', () => {
    const wrapper = shallow(
      <EventPageContent
        hasProposeEventEnabled={false}
        event={presentialEvent.noGoogleAddress}
        viewer={user}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when event refused', () => {
    const wrapper = shallow(
      <EventPageContent
        hasProposeEventEnabled
        event={presentialEvent.withModerationMotive}
        viewer={user}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when remote event', () => {
    const wrapper = shallow(
      <EventPageContent
        hasProposeEventEnabled={false}
        event={presentialEvent.remote}
        viewer={user}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
