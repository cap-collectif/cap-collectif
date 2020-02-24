// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EventPageHeaderButtons } from './EventPageHeaderButtons';
import { $refType, $fragmentRefs } from '~/mocks';
import { features } from '~/redux/modules/default';

describe('<EventPageHeaderButtons />', () => {
  const props = {
    event: {
      id: 'Event1',
      title: 'Title of my event',
      createdAt: '2020:05:05',
      author: { $fragmentRefs, url: '/licensier', username: 'Jpec' },
      participants: { edges: [] },
      themes: [],
      review: { status: 'APPROVED' },
      $fragmentRefs,
      $refType,
    },
    query: {
      $fragmentRefs,
      $refType,
    },
    features: {
      ...features,
    },
  };

  it('renders correcty', () => {
    const wrapper = shallow(<EventPageHeaderButtons {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with the create event feature toggle set to true and the user being the author', () => {
    const createEventTrueAndAuthor = {
      ...props,
      features: {
        ...features,
        allow_users_to_propose_events: true,
      },
      event: { ...props.event, viewerDidAuthor: true },
    };
    const wrapper = shallow(<EventPageHeaderButtons {...createEventTrueAndAuthor} />);
    expect(wrapper).toMatchSnapshot();
  });
});
