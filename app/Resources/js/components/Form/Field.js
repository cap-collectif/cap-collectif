import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import Input from './Input';

const Field = React.createClass({
  displayName: 'Field',
  propTypes: {
    meta: PropTypes.shape({
      touched: PropTypes.bool.isRequired,
      error: PropTypes.node,
    }),
    labelClassName: PropTypes.string,
    divClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    autoComplete: PropTypes.string,
    disableValidation: PropTypes.bool,
    type: PropTypes.oneOf(['text', 'textarea', 'editor', 'select', 'checkbox', 'password', 'captcha', 'email']).isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    input: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      autoFocus: PropTypes.bool,
      value: PropTypes.any,
    }).isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { touched, error } = this.props.meta;
    const { autoComplete, disableValidation, placeholder, type, label, divClassName, wrapperClassName, labelClassName } = this.props;
    const { autoFocus, name } = this.props.input;
    const check = touched && !disableValidation;
    const input = (
      <Input
        type={type}
        name={name}
        wrapperClassName={wrapperClassName || ''}
        labelClassName={labelClassName || ''}
        label={label || null}
        placeholder={placeholder || null}
        errors={(check && error) ? this.getIntlMessage(error) : null}
        bsStyle={check ? (error ? 'error' : 'success') : null}
        hasFeedback={check}
        autoComplete={autoComplete}
        autoFocus={autoFocus || false}
        {...this.props.input}
      />
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
