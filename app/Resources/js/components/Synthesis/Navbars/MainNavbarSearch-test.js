/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import MainNavbarSearch from './MainNavbarSearch';
import IntlData from '../../../translations/FR';

describe('<MainNavbarSearch />', () => {
  const context = { router: {} };
  it('should render a search form', () => {
    const wrapper = shallow(<MainNavbarSearch {...IntlData} />,
      { context }
    );
    expect(wrapper.find('NavbarForm')).to.have.length(1);
    expect(wrapper.find('Input')).to.have.length(1);
  });
});
