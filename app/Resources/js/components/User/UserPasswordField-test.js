// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import UserPasswordField from './UserPasswordField';

describe('<UserPasswordField />', () => {
  const props = {
    id: 'id',
    divClassName: 'div',
    label: 'label',
    labelClassName: 'label-class',
    name: 'password',
    formName: 'form-name',
  };

  it('renders a passwordField', () => {
    const wrapper = shallow(<UserPasswordField {...props} />);
    expect(wrapper).toMatchSnapshot();
    wrapper.instance().setPasswordFocusToTrue();
    expect(wrapper).toMatchSnapshot();
    wrapper.instance().setPasswordFocusToFalse();
    expect(wrapper).toMatchSnapshot();
  });
});
