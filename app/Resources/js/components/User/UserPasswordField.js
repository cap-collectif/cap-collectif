// @flow
import React from 'react';
import { Field } from 'redux-form';
import component from '../Form/Field';
import UserPasswordComplexityUtils from './UserPasswordComplexityUtils';
import type { Dispatch } from '../../types';

type Props = {|
  +id: string,
  +divClassName?: string,
  +name: string,
  +passwordComplexityScore: number,
  +passwordConditions: Object,
  +dispatch: Dispatch,
  +error: ?string,

  +ariaRequired?: boolean,
  +autoComplete?: string,
  +label?: any,
  +labelClassName?: string,
|};

type State = {|
  isPasswordFocus: boolean,
|};

class UserPasswordField extends React.Component<Props, State> {
  static defaultProps = {
    passwordComplexityScore: 0,
    passwordConditions: {
      length: false,
      upperLowercase: false,
      digit: false,
    },
    error: null,
  };

  state = {
    isPasswordFocus: false,
  };

  render() {
    const {
      id,
      divClassName,
      name,
      dispatch,
      error,
      passwordComplexityScore,
      passwordConditions,
      ariaRequired,
      autoComplete,
      label,
      labelClassName,
    } = this.props;

    const { isPasswordFocus } = this.state;

    return (
      <UserPasswordComplexityUtils
        passwordComplexityScore={passwordComplexityScore}
        passwordConditions={passwordConditions}
        dispatch={dispatch}
        error={error}
        field={
          <Field
            type="password"
            component={component}
            onFocus={() => {
              this.setState({
                isPasswordFocus: true,
              });
            }}
            onBlur={() => {
              this.setState({
                isPasswordFocus: false,
              });
            }}
            name={name}
            id={id}
            divClassName={divClassName}
            hideValidationMessage={isPasswordFocus}
            ariaRequired={ariaRequired}
            autoComplete={autoComplete}
            label={label || null}
            labelClassName={labelClassName || ''}
          />
        }
      />
    );
  }
}

export default UserPasswordField;
