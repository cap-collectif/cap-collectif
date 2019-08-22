// @flow
import React from 'react';
import { Field } from 'redux-form';
import component from '../Form/Field';
import UserPasswordComplexityUtils from './UserPasswordComplexityUtils';

type Props = {|
  +id: string,
  +divClassName?: string,
  +formName: string,
  +name: string,
  +ariaRequired?: boolean,
  +autoComplete?: string,
  +label?: any,
  +labelClassName?: string,
|};

type State = {|
  isPasswordFocus: boolean,
|};

class UserPasswordField extends React.Component<Props, State> {
  state = {
    isPasswordFocus: false,
  };

  render() {
    const {
      id,
      divClassName,
      name,
      ariaRequired,
      autoComplete,
      formName,
      label,
      labelClassName,
    } = this.props;
    const { isPasswordFocus } = this.state;

    return (
      <UserPasswordComplexityUtils
        name={name}
        formName={formName}
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
