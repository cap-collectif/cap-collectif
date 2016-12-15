/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { Navbar, Input } from 'react-bootstrap';
import MainNavbarSearch from './MainNavbarSearch';
import IntlData from '../../../translations/FR';

describe('<MainNavbarSearch />', () => {
  const context = { router: {} };
  it('should render a search form', () => {
    const wrapper = shallow(<MainNavbarSearch {...IntlData} />,
      { context },
    );
    expect(wrapper.find(Navbar.Form)).toHaveLength(1);
    expect(wrapper.find(Input)).toHaveLength(1);
  });
});
