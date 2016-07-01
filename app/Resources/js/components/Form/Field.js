import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import Input from './Input';

const Field = React.createClass({
  propTypes: {
    type: PropTypes.oneOf(['text', 'editor', 'select']).isRequired,
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    touched: PropTypes.bool.isRequired,
    error: PropTypes.node,
    validate: PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      valdiate: true,
    };
  },

  render() {
    const { validate, touched, error, label, placeholder, type } = this.props;
    const check = validate && touched;
    return (
      <Input
        type={type}
        labelClassName={''}
        label={label}
        placeholder={placeholder || label}
        errors={(check && error) ? this.getIntlMessage(error) : null}
        bsStyle={check ? (error ? 'error' : 'success') : null}
        hasFeedback={check}
        {...this.props}
      />
    );
  },
});

export default Field;
