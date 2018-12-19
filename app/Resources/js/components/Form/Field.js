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
  },
  backgroundColor?: ?string,
  labelClassName?: string,
  divClassName?: string,
  wrapperClassName?: string,
  help?: string,
  helpPrint?: boolean,
  description?: string,
  formName?: string,
  autoComplete?: string,
  disableValidation?: boolean,
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
  render() {
    const { touched, error, dirty } = this.props.meta;
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
      lang,
      step,
    } = this.props;
    const { autoFocus, name } = this.props.input;
    const check = touched || (dirty && !disableValidation);

    let errorMessage = null;

    if (check && error) {
      if (error.id) {
        errorMessage = <FormattedMessage id={error.id} values={error.values} />;
      } else {
        errorMessage = <FormattedMessage id={error} />;
      }
    }

    const input = (
      <Input
        id={id}
        type={type}
        name={name}
        help={help}
        helpPrint={helpPrint}
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
