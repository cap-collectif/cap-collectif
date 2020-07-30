/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EventPageHeader } from './EventPageHeader';
import { $fragmentRefs, $refType } from '~/mocks';

const baseEvent = {
  $fragmentRefs,
  $refType,
  id: '123454321',
  isPresential: true,
  animator: null,
  title: 'Ceci est un titre',
  viewerDidAuthor: false,
  timeRange: {
    startAt: '2020-07-01T13:48:28.082Z',
    endAt: '2020-07-01T13:55:28.082Z',
  },
  googleMapsAddress: {
    formatted: '12 rue des pissenlits - 75002 Paris, France',
  },
  themes: [
    {
      __typename: 'Theme',
      $fragmentRefs,
    },
    {
      __typename: 'Theme',
      $fragmentRefs,
    },
  ],
  author: {
    id: 'authorId',
    username: 'Jean Necrideteste',
    url: 'https://monurl.fr',
    $fragmentRefs,
  },
  review: {
    status: 'APPROVED',
  },
  comments: {
    totalCount: 12,
  },
  participants: {
    totalCount: 1,
  },
};

const event = {
  basic: baseEvent,
  remote: {
    ...baseEvent,
    isPresential: false,
  },
  noGoogleAddress: {
    ...baseEvent,
    googleMapsAddress: null,
  },
  viewerIsAuthor: {
    ...baseEvent,
    viewerDidAuthor: true,
  },
  noTheme: {
    ...baseEvent,
    themes: [],
  },
};

const query = {
  $fragmentRefs,
  $refType,
};

describe('<EventPageHeader />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <EventPageHeader
        event={event.basic}
        query={query}
        hasThemeEnabled
        hasProfileEnabled
        hasProposeEventEnabled
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when type online', () => {
    const wrapper = shallow(
      <EventPageHeader
        event={event.remote}
        query={query}
        hasThemeEnabled
        hasProfileEnabled
        hasProposeEventEnabled
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no googleAddress', () => {
    const wrapper = shallow(
      <EventPageHeader
        event={event.noGoogleAddress}
        query={query}
        hasThemeEnabled
        hasProfileEnabled
        hasProposeEventEnabled
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when viewer is author', () => {
    const wrapper = shallow(
      <EventPageHeader
        event={event.viewerIsAuthor}
        query={query}
        hasProfileEnabled
        hasProposeEventEnabled
        hasThemeEnabled
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no theme', () => {
    const wrapper = shallow(
      <EventPageHeader
        event={event.noTheme}
        query={query}
        hasProfileEnabled
        hasThemeEnabled={false}
        hasProposeEventEnabled
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
