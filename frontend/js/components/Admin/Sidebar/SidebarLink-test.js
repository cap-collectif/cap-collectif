// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { SidebarLink } from './SidebarLink';

describe('<SidebarLink />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<SidebarLink text="Réglages" href="/réglages" />);
    expect(wrapper).toMatchSnapshot();
  });
});
