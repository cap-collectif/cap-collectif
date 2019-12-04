/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { Header } from './Header';

describe('<Header />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Header>My Header</Header>);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with other bgColor', () => {
    const wrapper = shallow(<Header bgColor="green">My Header</Header>);
    expect(wrapper).toMatchSnapshot();
  });
});
