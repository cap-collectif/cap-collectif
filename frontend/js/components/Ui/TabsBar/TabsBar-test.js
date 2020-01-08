// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import TabsBar from './TabsBar';

describe('<TabsBar />', () => {
  const props = {
    items: [],
    vertical: false,
  };

  it('should render', () => {
    const wrapper = shallow(<TabsBar {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
