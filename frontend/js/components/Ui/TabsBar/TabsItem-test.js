// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import TabsItem from './TabsItem';

describe('<TabsItem />', () => {
  const props = {
    item: {
      id: 6,
      title: 'Comment ça marche',
      link: '/pages/comment-%C3%A7a-marche',
      hasEnabledFeature: true,
      children: [],
      active: false,
    },
  };

  it('should render', () => {
    const wrapper = shallow(<TabsItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
