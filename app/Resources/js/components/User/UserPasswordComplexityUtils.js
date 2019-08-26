// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { OverlayTrigger, Popover, ProgressBar } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { fetchQuery, graphql } from 'react-relay';
import { change, formValueSelector, getFormAsyncErrors } from 'redux-form';
import { connect } from 'react-redux';
import CheckCircle from '../Ui/Icons/CheckCircle';
import config from '../../config';
import type { Dispatch, State } from '../../types';
import environment from '../../createRelayEnvironment';
import { formName as CHANGE_PASSWORD_FORM_NAME } from './Profile/ChangePasswordForm';

type Props = {|
  +name: string,
  +field: Object,
  +formName: string,
  +isPasswordFocus: boolean,
  +passwordComplexityScore: number,
  +passwordConditions: { length: boolean, upperLowercase: boolean, digit: boolean },
  +formAsyncErrors: Object,
|};

const StyleContainer = styled.div`
  display: inline-block;
  width: 100%;

  .bg-danger .progress-bar {
    background-color: red;
  }

  .bg-warning .progress-bar {
    background-color: yellow;
  }

  .bg-success .progress-bar {
    background-color: green;
  }

  .text-green {
    color: green;
  }

  .text-red {
    color: red;
  }

  .text-gray {
    color: #a7a0a0;
  }

  .progress {
    height: 5px;
  }

  .img-check-circle {
    margin-right: 5px;
  }

  .info-centered {
    margin: auto;
    padding-left: 2%;
    padding-right: 2%;
  }
`;

export const getMatchingPasswordError = (passwordFieldName: string, passwordConditions: Object) => {
  let error = null;
  const errorObject = {};
  const sum =
    (passwordConditions.length ? 0 : 1) +
    (passwordConditions.upperLowercase ? 0 : 2) +
    (passwordConditions.digit ? 0 : 4);
  switch (sum) {
    case 0:
      return null;
    case 1:
      error = 'registration.constraints.password.min';
      break;
    case 2:
      error = 'at-least-one-uppercase-one-lowercase';
      break;
    case 3:
      error = 'at-least-8-characters-one-uppercase-one-lowercase';
      break;
    case 4:
      error = 'at-least-one-digit';
      break;
    case 5:
      error = 'at-least-8-characters-one-digit';
      break;
    case 6:
      error = 'at-least-one-digit-one-uppercase-one-lowercase';
      break;
    case 7:
      error = 'at-least-8-characters-one-digit-one-uppercase-one-lowercase';
      break;
    default:
      return null;
  }
  errorObject[passwordFieldName] = error;
  return errorObject;
};

export const checkPasswordConditions = (password: string) => {
  const passwordConditions = {
    length: false,
    upperLowercase: false,
    digit: false,
  };
  let hasUppercase = false;
  let hasLowercase = false;
  let i = 0;
  let character: number;
  const length = password ? password.length : 0;

  if (length > 7 && length < 73) {
    passwordConditions.length = true;
  }

  while (i < length) {
    character = password.charCodeAt(i);
    // Check if character is a digit
    if (character > 47 && character < 58) {
      passwordConditions.digit = true;
    } else {
      // Check if character is uppercase
      if (character > 64 && character < 91) {
        hasUppercase = true;
      }
      // Check if character is lowercase
      if (character > 96 && character < 123) {
        hasLowercase = true;
      }
    }
    i++;
  }

  if (hasUppercase && hasLowercase) {
    passwordConditions.upperLowercase = true;
  }
  return passwordConditions;
};

const getPasswordComplexityScore = graphql`
  query UserPasswordComplexityUtils_PasswordComplexityScoreQuery(
    $username: String
    $email: String
    $password: String!
  ) {
    passwordComplexityScore(username: $username, password: $password, email: $email)
  }
`;

export const asyncPasswordValidate = (
  formName: string,
  passwordFieldName: string,
  values: Object,
  dispatch: Dispatch,
): Promise<void> => {
  const passwordConditions = checkPasswordConditions(values[passwordFieldName]);
  dispatch(change(formName, 'passwordConditions', passwordConditions));

  const credentialValues = {
    password: values[passwordFieldName],
    email: values.email === undefined ? null : values.email,
  };

  return new Promise((resolve, reject) => {
    fetchQuery(environment, getPasswordComplexityScore, credentialValues).then(res => {
      dispatch(
        change(
          formName,
          'passwordComplexityScore',
          res.passwordComplexityScore + (passwordConditions.length ? 1 : 0),
        ),
      );
    });

    const error = getMatchingPasswordError(passwordFieldName, passwordConditions);
    if (error) {
      reject(error);
    }
    resolve();
  });
};

export class UserPasswordComplexityField extends Component<Props> {
  getMatchingPasswordSecurityAttributes(passwordComplexityScore: number) {
    switch (passwordComplexityScore) {
      case 0:
        return {
          text: 'synthesis.source_types.none',
          color: '',
        };
      case 1:
        return {
          text: 'very-weak',
          color: 'bg-danger',
        };
      case 2:
        return {
          text: 'weak',
          color: 'bg-danger',
        };
      case 3:
        return {
          text: 'medium',
          color: 'bg-warning',
        };
      case 4:
        return {
          text: 'strong',
          color: 'bg-success',
        };
      case 5:
        return {
          text: 'very-strong',
          color: 'bg-success',
        };
      default:
        return {
          text: 'synthesis.source_types.none',
          color: '',
        };
    }
  }

  renderPasswordInformation(
    formName: string,
    isPasswordFocus: boolean,
    passwordConditions: Object,
    passwordComplexityScore: number,
    error: ?string,
  ) {
    if (!isPasswordFocus) {
      return null;
    }
    return (
      <StyleContainer>
        <div
          className={`${config.isMobile ? 'mb-20' : ''} ${
            config.isMobile && formName === CHANGE_PASSWORD_FORM_NAME ? 'info-centered' : ''
          }`}>
          <FormattedMessage id="your-password-must-have" />

          <div
            className={`mb-5 mt-5 ${
              passwordConditions && passwordConditions.length ? 'text-green' : 'text-gray'
            }`}>
            <CheckCircle
              color={passwordConditions && passwordConditions.length ? 'green' : '#a7a0a0'}
            />
            <FormattedMessage id="at-least-8-characters" />
          </div>

          <div
            className={`mb-5 mt-5 ${
              passwordConditions && passwordConditions.upperLowercase ? 'text-green' : 'text-gray'
            }`}>
            <CheckCircle
              color={passwordConditions && passwordConditions.upperLowercase ? 'green' : '#a7a0a0'}
            />
            <FormattedMessage id="lower-and-upper-case-letters" />
          </div>

          <div
            className={`mb-5 mt-5 ${
              passwordConditions && passwordConditions.digit ? 'text-green' : 'text-gray'
            }`}>
            <CheckCircle
              color={passwordConditions && passwordConditions.digit ? 'green' : '#a7a0a0'}
            />
            <FormattedMessage id="at-least-1-digit" />
          </div>

          <div>
            <FormattedMessage id="password.security" />{' '}
            <FormattedMessage
              id={this.getMatchingPasswordSecurityAttributes(passwordComplexityScore).text}
            />
          </div>
          <ProgressBar
            now={20 * passwordComplexityScore}
            className={this.getMatchingPasswordSecurityAttributes(passwordComplexityScore).color}
          />

          {error ? (
            <span className="text-red">
              <FormattedMessage id={error} />
            </span>
          ) : (
            <FormattedMessage id="avoid-passwords" />
          )}
        </div>
      </StyleContainer>
    );
  }

  render() {
    const {
      field,
      passwordComplexityScore,
      passwordConditions,
      formAsyncErrors,
      name,
      isPasswordFocus,
      formName,
    } = this.props;

    if (config.isMobile) {
      return (
        <>
          {field}

          {this.renderPasswordInformation(
            formName,
            isPasswordFocus,
            passwordConditions,
            passwordComplexityScore,
            formAsyncErrors ? formAsyncErrors[name] : null,
          )}
        </>
      );
    }
    return (
      <OverlayTrigger
        placement="right"
        overlay={
          <Popover placement="right" className="in" id="pinned-label">
            {this.renderPasswordInformation(
              formName,
              isPasswordFocus,
              passwordConditions,
              passwordComplexityScore,
              formAsyncErrors ? formAsyncErrors[name] : null,
            )}
          </Popover>
        }>
        {field}
      </OverlayTrigger>
    );
  }
}

const mapStateToProps = (state: State, props: Props) => ({
  formAsyncErrors: getFormAsyncErrors(props.formName)(state),
  passwordComplexityScore: formValueSelector(props.formName)(state, 'passwordComplexityScore'),
  passwordConditions: formValueSelector(props.formName)(state, 'passwordConditions'),
});

export default connect(mapStateToProps)(UserPasswordComplexityField);
