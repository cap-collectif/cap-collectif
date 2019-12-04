// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { CookieModal } from './CookieModal';

describe('<CookieModal />', () => {
  const props = {
    separator: '',
  };
  it('should render correctly open', () => {
    const wrapper = shallow(<CookieModal {...props} />);
    wrapper.setState({ open: true });
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly close', () => {
    const wrapper = shallow(<CookieModal {...props} />);
    wrapper.setState({ open: false });
    expect(wrapper).toMatchSnapshot();
  });
});
