// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { FranceConnectLoginButton } from './FranceConnectLoginButton';

describe('<FranceConnectLoginButton />', () => {
  it('renders', () => {
    const wrapper = shallow(<FranceConnectLoginButton />);
    expect(wrapper).toMatchSnapshot();
  });
});
