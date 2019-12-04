// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { UserPasswordField } from './UserPasswordField';
import { features } from '../../redux/modules/default';

describe('<UserPasswordField />', () => {
  const props = {
    features,
    id: 'id',
    formName: 'form-name',
    name: 'password',
    divClassName: 'div',
    label: 'label',
    labelClassName: 'label-class',
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
