// @flow
/* eslint-env jest */
import { validate } from './RegistrationForm';
import { basicProps } from './RegistrationForm-test';

const basicValues = {
  locale: basicProps.locale,
  username: "Jean·Du_pont-Du'77 who lôve chocolaté",
  email: 'jeandupontdu77@gmail.com',
  plainPassword: 'Password1',
  charte: 'blabla',
  captcha: true,
  responses: basicProps.responses,
  questions: basicProps.query.registrationForm?.questions || [],
};

const errorsExpected = {
  noErrors: {},
  noValidUsername: {
    username: 'registration.constraints.username.symbol',
  },
  noValidEmail: {
    email: 'global.constraints.email.invalid',
  },
};

const valuesRegistrationForm = {
  values: basicValues,
  noValidUsername: {
    ...basicValues,
    username: 'Jean?Du(p)ontDu!77',
  },
  noValidEmail: {
    ...basicValues,
    email: 'tututututu',
  },
};

describe('validate RegistrationForm', () => {
  it('should validate', () => {
    const errors = validate(valuesRegistrationForm.values, basicProps);
    expect(errors).toEqual(errorsExpected.noErrors);
  });

  it('should not validate with invalid username', () => {
    const errors = validate(valuesRegistrationForm.noValidUsername, basicProps);
    expect(errors).toEqual(errorsExpected.noValidUsername);
  });

  it('should not validate with invalid email', () => {
    const errors = validate(valuesRegistrationForm.noValidEmail, basicProps);
    expect(errors).toEqual(errorsExpected.noValidEmail);
  });
});
