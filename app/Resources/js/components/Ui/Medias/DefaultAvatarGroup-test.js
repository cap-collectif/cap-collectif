/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { DefaultAvatarGroup } from './DefaultAvatarGroup';

const props = {
  size: 'small',
};

describe('<DefaultAvatarGroup />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<DefaultAvatarGroup />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with other size', () => {
    const wrapper = shallow(<DefaultAvatarGroup {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
