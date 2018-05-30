// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Input from './Input';

const Field = React.createClass({
  propTypes: {
    meta: PropTypes.shape({
      touched: PropTypes.bool.isRequired,
      dirty: PropTypes.bool,
      pristine: PropTypes.bool,
      error: PropTypes.any,
    }).isRequired,
    labelClassName: PropTypes.string,
    divClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    help: PropTypes.string,
    description: PropTypes.string,
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
    radioChecked: PropTypes.bool,
    input: PropTypes.shape({
      name: PropTypes.string.isRequired,
      autoFocus: PropTypes.bool,
      onChange: PropTypes.func,
      onBlur: PropTypes.func,
      value: PropTypes.any,
    }).isRequired,
    style: PropTypes.object,
    radioImage: PropTypes.object,
  },
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
      description,
      formName,
      addonAfter,
      addonBefore,
      choices,
      isOtherAllowed,
      style,
      radioImage,
      radioChecked,
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
        hasFeedback={check}
        autoComplete={autoComplete}
        autoFocus={autoFocus || false}
        choices={choices}
        style={style}
        radioChecked={radioChecked}
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
