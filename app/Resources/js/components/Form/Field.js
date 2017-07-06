// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import Input from './Input';

const Field = React.createClass({
  displayName: 'Field',
  propTypes: {
    meta: PropTypes.shape({
      touched: PropTypes.bool.isRequired,
      error: PropTypes.node,
    }).isRequired,
    labelClassName: PropTypes.string,
    divClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    help: PropTypes.string,
    autoComplete: PropTypes.string,
    disableValidation: PropTypes.bool,
    type: PropTypes.oneOf([
      'text',
      'textarea',
      'editor',
      'select',
      'checkbox',
      'password',
      'captcha',
      'email',
      'image',
      'medias',
    ]).isRequired,
    label: PropTypes.any,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    image: PropTypes.string,
    children: PropTypes.any,
    id: PropTypes.string.isRequired,
    popover: PropTypes.object,
    input: PropTypes.shape({
      name: PropTypes.string.isRequired,
      autoFocus: PropTypes.bool,
      onChange: PropTypes.func,
      value: PropTypes.any,
    }).isRequired,
  },
  mixins: [IntlMixin],

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
    } = this.props;
    const { autoFocus, name } = this.props.input;
    const check = touched && !disableValidation;
    const input = (
      <Input
        id={id}
        type={type}
        name={name}
        help={help}
        disabled={disabled}
        popover={popover}
        wrapperClassName={wrapperClassName || ''}
        labelClassName={labelClassName || ''}
        label={label || null}
        placeholder={placeholder || null}
        errors={check && error ? this.getIntlMessage(error) : null}
        validationState={check ? (error ? 'error' : 'success') : null}
        hasFeedback={check}
        autoComplete={autoComplete}
        autoFocus={autoFocus || false}
        {...this.props.input}>
        {children}
      </Input>
    );
    if (divClassName) {
      return (
        <div className={divClassName}>
          {input}
        </div>
      );
    }
    return input;
  },
});

export default Field;
