import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import Input from './Input';

const Field = React.createClass({
  propTypes: {
    type: PropTypes.oneOf(['text', 'editor']).isRequired,
    label: PropTypes.string.isRequired,

  },
  mixins: [IntlMixin],

  render() {
    const props = this.props;
    return (
      <Input
        type={props.type}
        labelClassName={''}
        label={props.label}
        placeholder={props.placeholder || props.label}
        errors={(props.touched && props.error) ? this.getIntlMessage(props.error) : null}
        bsStyle={props.touched ? (props.error ? 'error' : 'success') : null}
        hasFeedback={props.touched}
        {...props}
      />
    );
  },
});

export default Field;
