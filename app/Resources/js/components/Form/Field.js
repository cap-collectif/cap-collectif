// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Input from './Input';

const Field = React.createClass({
  propTypes: {
    meta: PropTypes.shape({
      touched: PropTypes.bool.isRequired,
      error: PropTypes.node,
    }).isRequired,
    labelClassName: PropTypes.string,
    divClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    help: PropTypes.string,
    formName: PropTypes.string,
    autoComplete: PropTypes.string,
    disableValidation: PropTypes.bool,
    type: PropTypes.oneOf([
      'address',
      'text',
      'number',
      'datetime',
      'textarea',
      'editor',
      'select',
      'checkbox',
      'password',
      'captcha',
      'email',
      'radio-buttons',
      'image',
      'medias',
      'ranking',
      'radio',
      'button',
    ]).isRequired,
    addonAfter: PropTypes.any,
    addonBefore: PropTypes.any,
    label: PropTypes.any,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    isOtherAllowed: PropTypes.bool,
    image: PropTypes.string,
    children: PropTypes.any,
    id: PropTypes.string.isRequired,
    popover: PropTypes.object,
    choices: PropTypes.array,
    checkedValue: PropTypes.string,
    input: PropTypes.shape({
      name: PropTypes.string.isRequired,
      autoFocus: PropTypes.bool,
      onChange: PropTypes.func,
      value: PropTypes.any,
    }).isRequired,
  },

  render() {
    const { touched, error } = this.props.meta;
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
      formName,
      addonAfter,
      addonBefore,
      choices,
      checkedValue,
      isOtherAllowed,
    } = this.props;
    const { autoFocus, name } = this.props.input;
    const check = touched && !disableValidation;
    const input = (
      <Input
        id={id}
        type={type}
        name={name}
        help={help}
        formName={formName}
        disabled={disabled}
        popover={popover}
        addonAfter={addonAfter}
        addonBefore={addonBefore}
        isOtherAllowed={isOtherAllowed}
        wrapperClassName={wrapperClassName || ''}
        labelClassName={labelClassName || ''}
        label={label || null}
        placeholder={placeholder || null}
        errors={check && error ? <FormattedMessage id={error} /> : null}
        validationState={check ? (error ? 'error' : 'success') : null}
        hasFeedback={check}
        autoComplete={autoComplete}
        autoFocus={autoFocus || false}
        choices={choices}
        checkedValue={checkedValue}
        {...this.props.input}>
        {children}
      </Input>
    );
    if (divClassName) {
      return <div className={divClassName}>{input}</div>;
    }
    return input;
  },
});

export default Field;
