/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EventPageContent } from './EventPageContent';
import { TYPE_EVENT } from '~/components/Event/EventPreview/EventPreview';
import { $fragmentRefs, $refType } from '~/mocks';

const baseEvent = {
  $fragmentRefs,
  $refType,
  id: '123id',
  title: 'Je suis un événement',
  url: 'https://jesuislurl.com',
  body: 'je suis le body',
  commentable: true,
  viewerDidAuthor: false,
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

const event = {
  basic: baseEvent,
  noCommentable: {
    ...baseEvent,
    commentable: false,
  },
  noRegistrationPossible: {
    ...baseEvent,
    isRegistrationPossible: false,
  },
  noGoogleAddress: {
    ...baseEvent,
    googleMapsAddress: null,
  },
  withModerationMotive: {
    ...baseEvent,
    viewerDidAuthor: true,
  },
};

const user = {
  $fragmentRefs,
  $refType,
};

describe('<EventPageContent />', () => {
  it('should render correctly when type physical', () => {
    const wrapper = shallow(
      <EventPageContent type={TYPE_EVENT.PHYSICAL} event={event.basic} user={user} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when type online', () => {
    const wrapper = shallow(
      <EventPageContent type={TYPE_EVENT.ONLINE} event={event.basic} user={user} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no commentable', () => {
    const wrapper = shallow(
      <EventPageContent type={TYPE_EVENT.PHYSICAL} event={event.noCommentable} user={user} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no registration possible', () => {
    const wrapper = shallow(
      <EventPageContent
        type={TYPE_EVENT.PHYSICAL}
        event={event.noRegistrationPossible}
        user={user}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no google address', () => {
    const wrapper = shallow(
      <EventPageContent type={TYPE_EVENT.PHYSICAL} event={event.noGoogleAddress} user={user} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when event refused', () => {
    const wrapper = shallow(
      <EventPageContent
        type={TYPE_EVENT.PHYSICAL}
        event={event.withModerationMotive}
        user={user}
        hasProposeEventEnabled
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
