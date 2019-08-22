// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Input from './Input';

type Props = {
  meta: {
    touched: boolean,
    dirty?: boolean,
    pristine?: boolean,
    error?: any,
    warning?: any,
  },
  backgroundColor?: ?string,
  labelClassName?: string,
  divClassName?: string,
  wrapperClassName?: string,
  help?: string,
  helpPrint?: boolean,
  ariaRequired?: boolean,
  description?: string,
  formName?: string,
  autoComplete?: string,
  disableValidation?: boolean,
  hideValidationMessage?: boolean,
  type:
    | 'address'
    | 'text'
    | 'number'
    | 'datetime'
    | 'textarea'
    | 'editor'
    | 'select'
    | 'checkbox'
    | 'password'
    | 'captcha'
    | 'email'
    | 'radio-buttons'
    | 'image'
    | 'medias'
    | 'ranking'
    | 'radio'
    | 'button',
  addonAfter?: any,
  addonBefore?: any,
  label?: any,
  placeholder?: string,
  disabled?: boolean,
  isOtherAllowed?: boolean,
  validationRule?: {
    type: string,
    number: number,
  },
  image?: string,
  children?: any,
  id: string,
  popover?: Object,
  choices?: Array<$FlowFixMe>,
  radioChecked?: boolean,
  input: {
    name: string,
    autoFocus?: boolean,
    onChange?: Function,
    onBlur?: Function,
    value?: any,
    disableValidation?: boolean,
  },
  style?: Object,
  radioImage?: Object,
  lang?: string,
  // to use in case of decimal number input
  step?: string,
};

class Field extends React.Component<Props> {
  static defaultProps = {
    hideValidationMessage: false,
  };

  render() {
    const { touched, error, dirty, warning } = this.props.meta;
    const {
      popover,
      children,
      id,
      autoComplete,
      disableValidation,
      placeholder,
      type,
      label,
      divClassName,
      wrapperClassName,
      labelClassName,
      disabled,
      help,
      helpPrint,
      ariaRequired,
      description,
      formName,
      addonAfter,
      addonBefore,
      choices,
      isOtherAllowed,
      validationRule,
      style,
      radioImage,
      radioChecked,
      hideValidationMessage,
      lang,
      step,
    } = this.props;
    const { autoFocus, name } = this.props.input;
    const check = touched || (dirty && !disableValidation);

    let errorMessage = null;
    let warningMessage = null;

    if (check && error && !hideValidationMessage) {
      if (error.id) {
        errorMessage = <FormattedMessage id={error.id} values={error.values} />;
      } else {
        errorMessage = <FormattedMessage id={error} />;
      }
    }

    if (check && warning) {
      if (warning.id) {
        warningMessage = <FormattedMessage id={warning.id} values={warning.values} />;
      } else {
        warningMessage = <FormattedMessage id={warning} />;
      }
    }

    const input = (
      <Input
        id={id}
        type={type}
        name={name}
        help={help}
        helpPrint={helpPrint}
        ariaRequired={ariaRequired}
        description={description}
        formName={formName}
        disabled={disabled}
        popover={popover}
        addonAfter={addonAfter}
        image={radioImage ? radioImage.url : null}
        addonBefore={addonBefore}
        isOtherAllowed={isOtherAllowed}
        wrapperClassName={wrapperClassName || ''}
        labelClassName={labelClassName || ''}
        label={label || null}
        placeholder={placeholder || null}
        errors={errorMessage}
        warnings={warningMessage}
        validationState={check ? (error ? 'error' : 'success') : null}
        validationRule={validationRule}
        autoComplete={autoComplete}
        autoFocus={autoFocus || false}
        choices={choices}
        style={style}
        radioChecked={radioChecked}
        lang={lang}
        step={step}
        {...this.props.input}>
        {children}
      </Input>
    );
    if (divClassName) {
      return <div className={divClassName}>{input}</div>;
    }
    return input;
  }
}

export default Field;
