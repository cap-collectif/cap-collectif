// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { SidebarButton } from './SidebarButton';

describe('<SidebarButton />', () => {
  const defaultProps = {
    icon: 'ENVELOPE_O',
    disabled: false,
    text: 'MAIL',
    isOpen: false,
  };

  it('renders correctly', () => {
    const wrapper = shallow(<SidebarButton {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly open', () => {
    const wrapper = shallow(<SidebarButton {...defaultProps} isOpen />);
    expect(wrapper).toMatchSnapshot();
  });
});
