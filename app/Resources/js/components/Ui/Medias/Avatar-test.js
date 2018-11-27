/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { Avatar } from './Avatar';

const props = {
  src: 'https://source.unsplash.com/collection/181462',
  alt: 'my alternative',
};

describe('<Avatar />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Avatar {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with other size & className', () => {
    const wrapper = shallow(<Avatar {...props} />);
    wrapper.setProps({ size: 34, className: 'myClass' });
    expect(wrapper).toMatchSnapshot();
  });
});
