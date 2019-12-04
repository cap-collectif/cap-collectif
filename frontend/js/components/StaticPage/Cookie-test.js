// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import Cookie from './Cookie';

describe('<Cookie />', () => {
  const props = {
    analyticsJs:
      "      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\n" +
      '      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n' +
      '      m=s.getElementsByTagName(o)[0];a.async=0;a.src=g;m.parentNode.insertBefore(a,m)\n' +
      "      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');\n" +
      '\n' +
      "      if(typeof window._capco_ga_cookie_value === 'undefined'){\n" +
      "        ga('create', 'UA-112509737-19', {'cookieDomain': '.capco.dev', 'cookieExpires': 1123200});\n" +
      '      }\n' +
      "      ga('send', 'pageview');",
    adJs: 'here your js code bullshit the users',
  };

  it('should render all accepted', () => {
    const wrapper = shallow(<Cookie {...props} />);
    wrapper.setState({ isAnalyticEnabled: true });
    wrapper.setState({ isAdvertisingEnabled: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render analytics only accepted', () => {
    const wrapper = shallow(<Cookie {...props} />);
    wrapper.setState({ isAnalyticEnabled: true });
    wrapper.setState({ isAdvertisingEnabled: false });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render advertising only accepted', () => {
    const wrapper = shallow(<Cookie {...props} />);
    wrapper.setState({ isAnalyticEnabled: false });
    wrapper.setState({ isAdvertisingEnabled: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render all refused', () => {
    const wrapper = shallow(<Cookie {...props} />);
    wrapper.setState({ isAnalyticEnabled: false });
    wrapper.setState({ isAdvertisingEnabled: false });
    expect(wrapper).toMatchSnapshot();
  });
});
