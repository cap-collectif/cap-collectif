// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import component from '../Form/Field';
import UserPasswordComplexityUtils from './UserPasswordComplexityUtils';
import type { FeatureToggles, State } from '../../types';

type Props = {|
  +features: FeatureToggles,
  +id: string,
  +formName: string,
  +name: string,
  +divClassName?: string,
  +ariaRequired?: boolean,
  +autoComplete?: string,
  +label?: any,
  +labelClassName?: string,
|};

type UserPasswordFieldState = {|
  isPasswordFocus: boolean,
|};

export class UserPasswordField extends React.Component<Props, UserPasswordFieldState> {
  state = {
    isPasswordFocus: false,
  };

  setPasswordFocusToTrue = () => {
    this.setState({
      isPasswordFocus: true,
    });
  };

  setPasswordFocusToFalse = () => {
    this.setState({
      isPasswordFocus: false,
    });
  };

  render() {
    const {
      features,
      id,
      formName,
      name,
      divClassName,
      ariaRequired,
      autoComplete,
      label,
      labelClassName,
    } = this.props;
    const { isPasswordFocus } = this.state;

    if (features.secure_password) {
      return (
        <UserPasswordComplexityUtils
          name={name}
          formName={formName}
          isPasswordFocus={isPasswordFocus}
          field={
            <Field
              type="password"
              component={component}
              onFocus={this.setPasswordFocusToTrue}
              onBlur={this.setPasswordFocusToFalse}
              name={name}
              id={id}
              divClassName={divClassName || ''}
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
    return (
      <Field
        type="password"
        component={component}
        onFocus={this.setPasswordFocusToTrue}
        onBlur={this.setPasswordFocusToFalse}
        name={name}
        id={id}
        divClassName={divClassName || ''}
        hideValidationMessage={isPasswordFocus}
        ariaRequired={ariaRequired}
        autoComplete={autoComplete}
        label={label || null}
        labelClassName={labelClassName || ''}
      />
    );
  }
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

export default connect(mapStateToProps)(UserPasswordField);
