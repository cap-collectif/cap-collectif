// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { CookieContent } from './CookieContent';

describe('<CookieContent />', () => {
  it('should render correctly with 2 cookies type', () => {
    const props = {
      analyticsJs: 'console.log("analyticsjs")',
      adJs: 'console.log("adJs")',
      cookiesList: '<p>cookieContent</p>',
    };
    const wrapper = shallow(<CookieContent {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with statistic cookie type', () => {
    const props = {
      analyticsJs: 'console.log("analyticsJs")',
      adJs: '',
      cookiesList: '<p>cookieContent</p>',
    };
    const wrapper = shallow(<CookieContent {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with ads cookie type', () => {
    const props = {
      analyticsJs: '',
      adJs: 'console.log("adJs")',
      cookiesList: '<p>cookieContent</p>',
    };
    const wrapper = shallow(<CookieContent {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with 0 cookie type', () => {
    const props = {
      analyticsJs: '',
      adJs: '',
      cookiesList: '<p>cookieContent</p>',
    };
    const wrapper = shallow(<CookieContent {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
