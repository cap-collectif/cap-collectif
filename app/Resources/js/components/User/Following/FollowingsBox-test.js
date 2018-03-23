/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { FollowingsBox } from './FollowingsBox';

describe('<FollowingsBox />', () => {
  it('render', () => {
    const wrapper = shallow(<FollowingsBox />);
    expect(wrapper).toMatchSnapshot();
  });
});
