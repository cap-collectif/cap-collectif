/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { FollowingsBox } from './FollowingsBox';

describe('<FollowingsBox />', () => {
  const props = {};

  it('render', () => {
    const wrapper = shallow(<FollowingsBox {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
