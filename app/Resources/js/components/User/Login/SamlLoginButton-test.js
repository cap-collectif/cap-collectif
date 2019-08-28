// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import SamlLoginButton from './SamlLoginButton';

describe('<SamlLoginButton />', () => {
  it('renders', () => {
    const wrapper = shallow(<SamlLoginButton />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with no prefix', () => {
    const wrapper = shallow(<SamlLoginButton prefix="" />);
    expect(wrapper).toMatchSnapshot();
  });
});
