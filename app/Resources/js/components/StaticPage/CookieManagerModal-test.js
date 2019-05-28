// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { CookieManagerModal } from './CookieManagerModal';

describe('<CookieManagerModal />', () => {
  const props = {
    analyticsJs: 'here your js to analyse the website',
    adJs: 'here your js code bullshit the users',
    bannerTrad: 'banner-trad',
    cookieTrad: 'cookie-trad',
    isLink: true,
    withListSeparator: true,
  };
  it('should render correctly open', () => {
    const wrapper = shallow(<CookieManagerModal {...props} />);
    wrapper.setState({ open: true });
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly close', () => {
    const wrapper = shallow(<CookieManagerModal {...props} />);
    wrapper.setState({ open: false });
    expect(wrapper).toMatchSnapshot();
  });
});
