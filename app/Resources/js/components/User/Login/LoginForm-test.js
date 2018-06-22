// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { LoginForm } from './LoginForm';

describe('<LoginForm />', () => {
  const props = {};

  it('renders a form with inputs', () => {
    const wrapper = shallow(<LoginForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
