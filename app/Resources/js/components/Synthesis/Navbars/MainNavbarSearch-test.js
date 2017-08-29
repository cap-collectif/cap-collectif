// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import MainNavbarSearch from './MainNavbarSearch';

describe('<MainNavbarSearch />', () => {
  const context = { router: {} };
  it('should render a search form', () => {
    const wrapper = shallow(<MainNavbarSearch />, { context });
    expect(wrapper).toMatchSnapshot();
  });
});
