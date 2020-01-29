// @flow
/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { EventDeleteButton } from './EventDeleteButton';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<EventEditButton />', () => {
  it('it renders correctly', () => {
    const props = {
      event: {
        id: 'Event1',
        title: 'Title of my event',
        createdAt: '2020:05:05',
        author: {
          url: '/licensier',
          username: 'Jpec',
          $fragmentRefs,
        },
        participants: { edges: [] },
        themes: [],
        $refType,
        $fragmentRefs,
      },
    };
    const wrapper = shallow(<EventDeleteButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
