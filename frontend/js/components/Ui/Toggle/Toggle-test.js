// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import Toggle from './Toggle';

describe('<Toggle />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<Toggle />);
    expect(wrapper).toMatchSnapshot();
  });
});
