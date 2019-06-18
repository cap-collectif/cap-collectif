/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import NavigationSkip from './NavigationSkip';

describe('<NavigationSkip />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<NavigationSkip />);
    expect(wrapper).toMatchSnapshot();
  });
});
