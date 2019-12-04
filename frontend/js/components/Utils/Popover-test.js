// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import Popover from './Popover';

describe('<Popover />', () => {
  const props = {
    children: 'child',
  };

  it('should render correctly', () => {
    const wrapper = shallow(<Popover {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
