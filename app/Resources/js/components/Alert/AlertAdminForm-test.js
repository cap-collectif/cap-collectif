// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { AlertAdminForm } from './AlertAdminForm';

describe('<AlertAdminForm />', () => {
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

  it('render correctly the message for submit succeeded', () => {
    const wrapper = shallow(<AlertAdminForm {...submitSucceededForm} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly the message for submit failed', () => {
    const wrapper = shallow(<AlertAdminForm {...submitFailedForm} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly the message for invalid form', () => {
    const wrapper = shallow(<AlertAdminForm {...invalidForm} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render no message when the form is valid', () => {
    const wrapper = shallow(<AlertAdminForm {...validForm} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render no message during submitting of form', () => {
    const wrapper = shallow(<AlertAdminForm {...submittingForm} />);
    expect(wrapper).toMatchSnapshot();
  });
});
