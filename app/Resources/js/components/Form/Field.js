import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import Input from './Input';

const Field = React.createClass({
  displayName: 'Field',
  propTypes: {
    touched: PropTypes.bool.isRequired,
    error: PropTypes.node,
    input: PropTypes.shape({
      divClassName: PropTypes.string,
      disableValidation: PropTypes.bool,
      type: PropTypes.oneOf(['text', 'editor', 'select', 'checkbox']).isRequired,
      label: PropTypes.string.isRequired,
      placeholder: PropTypes.string,
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      autoFocus: PropTypes.bool.isRequired,
      value: PropTypes.any,
    }).isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { touched, error } = this.props;
    const { disableValidation, label, placeholder, type, name, divClassName } = this.props.input;
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
