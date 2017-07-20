// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import MainNavbarSearch from './MainNavbarSearch';
import IntlData from '../../../translations/FR';

describe('<MainNavbarSearch />', () => {
  const context = { router: {} };
  it('should render a search form', () => {
    const wrapper = shallow(<MainNavbarSearch {...IntlData} />, { context });
    expect(wrapper).toMatchSnapshot();
  });
});
