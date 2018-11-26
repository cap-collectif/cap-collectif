/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { DefaultAvatar } from './DefaultAvatar';

const props = {
  size: 30,
};

describe('<DefaultAvatar />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<DefaultAvatar />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with other size', () => {
    const wrapper = shallow(<DefaultAvatar {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
