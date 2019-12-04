/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { Navbar } from './Navbar';
import { intlMock } from '../../mocks';

const props = {
  intl: intlMock,
  logo: 'Navbar-logo.png',
  items: [],
  siteName: 'cap-collectif.com',
  contentRight: <div id="content-contentRight" />,
};

describe('<Navbar />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Navbar {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
