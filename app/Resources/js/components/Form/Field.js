import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import Input from './Input';

export const Field = React.createClass({
  displayName: 'Field',
  propTypes: {
    type: PropTypes.oneOf(['text', 'editor', 'select', 'checkbox']).isRequired,
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    name: PropTypes.string.isRequired,
    touched: PropTypes.bool.isRequired,
    error: PropTypes.node,
    divClassName: PropTypes.string,
    disableValidation: PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      disableValidation: false,
      divClassName: null,
    };
  },

  render() {
    const { disableValidation, touched, error, label, placeholder, type, name, divClassName } = this.props;
    const check = touched && !disableValidation;
    const input = (
      <Input
        type={type}
        name={name}
        labelClassName={''}
        label={label}
        placeholder={placeholder || null}
        errors={(check && error) ? this.getIntlMessage(error) : null}
        bsStyle={check ? (error ? 'error' : 'success') : null}
        hasFeedback={check}
        {...this.props}
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
