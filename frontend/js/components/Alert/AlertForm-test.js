// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { AlertForm } from './AlertForm';

describe('<AlertForm />', () => {
  const customErrorMessageForm = {
    valid: false,
    invalid: true,
    submitting: false,
    submitSucceeded: true,
    submitFailed: true,
    errorMessage: 'error.test',
  };

  const submitSucceededForm = {
    valid: true,
    invalid: false,
    submitting: false,
    submitSucceeded: true,
    submitFailed: false,
  };

  const submitFailedForm = {
    valid: true,
    invalid: false,
    submitting: false,
    submitSucceeded: false,
    submitFailed: true,
  };

  const invalidForm = {
    valid: false,
    invalid: true,
    submitting: false,
    submitSucceeded: true,
    submitFailed: false,
  };

  const validForm = {
    valid: true,
    invalid: false,
    submitting: false,
    submitSucceeded: false,
    submitFailed: false,
  };

  const submittingForm = {
    valid: true,
    invalid: false,
    submitting: true,
    submitSucceeded: false,
    submitFailed: false,
  };

  it('render correctly the message with a custom error message', () => {
    const wrapper = shallow(<AlertForm {...customErrorMessageForm} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly the message for submit succeeded', () => {
    const wrapper = shallow(<AlertForm {...submitSucceededForm} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly the message for submit failed', () => {
    const wrapper = shallow(<AlertForm {...submitFailedForm} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly the message for invalid form', () => {
    const wrapper = shallow(<AlertForm {...invalidForm} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render no message when the form is valid', () => {
    const wrapper = shallow(<AlertForm {...validForm} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render no message during submitting of form', () => {
    const wrapper = shallow(<AlertForm {...submittingForm} />);
    expect(wrapper).toMatchSnapshot();
  });
});
