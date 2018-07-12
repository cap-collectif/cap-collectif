// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { OpinionSource } from './OpinionSource';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<OpinionSource />', () => {
  const sourceUserVip = {
    $refType,
    $fragmentRefs,
    author: {
      id: 'author1',
      displayName: 'author1',
      vip: true,
      media: null,
    },
    createdAt: '',
    id: '1',
    updatedAt: null,
  };
  const sourceUserNotVip = {
    $refType,
    $fragmentRefs,
    author: {
      id: 'author1',
      displayName: 'author1',
      vip: false,
      media: null,
    },
    createdAt: '',
    id: '1',
    updatedAt: null,
  };

  it('should render a li bordered', () => {
    const wrapper = shallow(<OpinionSource source={sourceUserVip} />);
    expect(wrapper.find('li.opinion.block--bordered')).toHaveLength(1);
  });

  it('should render a white li if not vip', () => {
    const wrapper = shallow(<OpinionSource source={sourceUserNotVip} />);
    expect(wrapper.find('li.bg-vip')).toHaveLength(0.0);
  });
});
