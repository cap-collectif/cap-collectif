/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';

import { shallow } from 'enzyme';
import MainNavbarSearch from './MainNavbarSearch';
import IntlData from '../../../translations/FR';
import { Navbar, Input } from 'react-bootstrap';

describe('<MainNavbarSearch />', () => {
  const context = { router: {} };
  it('should render a search form', () => {
    const wrapper = shallow(<MainNavbarSearch {...IntlData} />,
      { context }
    );
    expect(wrapper.find(Navbar.Form)).toHaveLength(1);
    expect(wrapper.find(Input)).toHaveLength(1);
  });
});
