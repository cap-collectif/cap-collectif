// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { Field } from 'redux-form';
import {
  checkPasswordConditions,
  getMatchingPasswordError,
  UserPasswordComplexityField,
} from './UserPasswordComplexityUtils';
import component from '../Form/Field';
import config from '../../config';

jest.mock('../../config');

describe('<UserPasswordComplexityField />', () => {
  const props = {
    name: 'password',
    field: (
      <Field
        type="password"
        component={component}
        name="password"
        id="password-field"
        divClassName="div"
        hideValidationMessage
        ariaRequired
        autoComplete
        labelClassName=""
      />
    ),
    formName: 'form-name',
    formAsyncErrors: null,
  };

  beforeEach(() => {
    config.isMobile = false;
  });

  it('renders a mobile version of the field', () => {
    config.isMobile = true;
    const wrapper = shallow(
      <UserPasswordComplexityField
        {...props}
        passwordComplexityScore={3}
        passwordConditions={{
          length: true,
          upperLowercase: false,
          digit: false,
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('gets correct passwordConditions with checkPasswordConditions', () => {
    expect(checkPasswordConditions('passWord91')).toMatchSnapshot();
  });

  it('gets bad passwordConditions with checkPasswordConditions', () => {
    expect(checkPasswordConditions('password')).toMatchSnapshot();
  });

  it('gets all errors with getMatchingPasswordError', () => {
    expect(
      getMatchingPasswordError('password-field', {
        length: false,
        upperLowercase: false,
        digit: false,
      }),
    ).toMatchSnapshot();
  });

  it('gets length and uppercase errors with getMatchingPasswordError', () => {
    expect(
      getMatchingPasswordError('password-field', {
        length: false,
        upperLowercase: false,
        digit: true,
      }),
    ).toMatchSnapshot();
  });

  it('gets no error with getMatchingPasswordError', () => {
    expect(
      getMatchingPasswordError('password-field', {
        length: true,
        upperLowercase: true,
        digit: true,
      }),
    ).toMatchSnapshot();
  });

  it('gets length and digit errors with getMatchingPasswordError', () => {
    expect(
      getMatchingPasswordError('password-field', {
        length: false,
        upperLowercase: true,
        digit: false,
      }),
    ).toMatchSnapshot();
  });

  it('gets digit and uppercase errors with getMatchingPasswordError', () => {
    expect(
      getMatchingPasswordError('password-field', {
        length: true,
        upperLowercase: false,
        digit: false,
      }),
    ).toMatchSnapshot();
  });

  it('gets length error with getMatchingPasswordError', () => {
    expect(
      getMatchingPasswordError('password-field', {
        length: false,
        upperLowercase: true,
        digit: true,
      }),
    ).toMatchSnapshot();
  });

  it('gets uppercase error with getMatchingPasswordError', () => {
    expect(
      getMatchingPasswordError('password-field', {
        length: true,
        upperLowercase: false,
        digit: true,
      }),
    ).toMatchSnapshot();
  });

  it('gets digit error with getMatchingPasswordError', () => {
    expect(
      getMatchingPasswordError('password-field', {
        length: true,
        upperLowercase: true,
        digit: false,
      }),
    ).toMatchSnapshot();
  });

  it('renders a UserPasswordComplexityField with a passwordComplexityScore of 0', () => {
    const wrapper = shallow(
      <UserPasswordComplexityField
        {...props}
        passwordComplexityScore={0}
        passwordConditions={{
          length: false,
          upperLowercase: false,
          digit: false,
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a UserPasswordComplexityField with a passwordComplexityScore of 1', () => {
    const wrapper = shallow(
      <UserPasswordComplexityField
        {...props}
        passwordComplexityScore={1}
        passwordConditions={{
          length: false,
          upperLowercase: true,
          digit: false,
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a UserPasswordComplexityField with a passwordComplexityScore of 2', () => {
    const wrapper = shallow(
      <UserPasswordComplexityField
        {...props}
        passwordComplexityScore={2}
        passwordConditions={{
          length: false,
          upperLowercase: false,
          digit: true,
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a UserPasswordComplexityField with a passwordComplexityScore of 3', () => {
    const wrapper = shallow(
      <UserPasswordComplexityField
        {...props}
        passwordComplexityScore={3}
        passwordConditions={{
          length: true,
          upperLowercase: false,
          digit: false,
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a UserPasswordComplexityField with a passwordComplexityScore of 4', () => {
    const wrapper = shallow(
      <UserPasswordComplexityField
        {...props}
        passwordComplexityScore={4}
        passwordConditions={{
          length: true,
          upperLowercase: true,
          digit: false,
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a UserPasswordComplexityField with a passwordComplexityScore of 5', () => {
    const wrapper = shallow(
      <UserPasswordComplexityField
        {...props}
        passwordComplexityScore={5}
        passwordConditions={{
          length: true,
          upperLowercase: false,
          digit: true,
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a UserPasswordComplexityField with a passwordComplexityScore of 6', () => {
    const wrapper = shallow(
      <UserPasswordComplexityField
        {...props}
        passwordComplexityScore={6}
        passwordConditions={{
          length: false,
          upperLowercase: true,
          digit: true,
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a UserPasswordComplexityField with a passwordComplexityScore of 7', () => {
    const wrapper = shallow(
      <UserPasswordComplexityField
        {...props}
        passwordComplexityScore={7}
        passwordConditions={{
          length: true,
          upperLowercase: true,
          digit: true,
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
