// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { CookieContent } from './CookieContent';

describe('<CookieContent />', () => {
  it('should render correctly with 2 cookies type', () => {
    const props = {
      platformLink: 'http://test.com',
      analyticsJs: 'console.log("analyticsjs")',
      adJs: 'console.log("adJs")',
      cookiesList: 'cookiecontent',
    };
    const wrapper = shallow(<CookieContent {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with 1 cookies type', () => {
    const props = {
      platformLink: 'http://test.com',
      analyticsJs: '',
      adJs: 'console.log("adJs)"',
      cookiesList: 'cookiecontent',
    };
    const wrapper = shallow(<CookieContent {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with 1 cookie type', () => {
    const props = {
      platformLink: 'http://test.com',
      analyticsJs: '',
      adJs: 'console.log("adJs")',
      cookiesList: 'cookiecontent',
    };
    const wrapper = shallow(<CookieContent {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with 0 cookies type', () => {
    const props = {
      platformLink: 'http://test.com',
      analyticsJs: '',
      adJs: '',
      cookiesList: 'cookiecontent',
    };
    const wrapper = shallow(<CookieContent {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
