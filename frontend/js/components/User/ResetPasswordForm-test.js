// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ResetPasswordForm } from './ResetPasswordForm';

describe('<ResetPasswordForm />', () => {
  const props = {
    token: 'ken-le-token',
    dispatch: jest.fn(),
    invalid: true,
    submitting: false,
    pristine: true,
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ResetPasswordForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
