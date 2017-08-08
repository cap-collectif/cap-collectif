// @flow
import React, { PropTypes } from 'react';
import ReactToggle from 'react-toggle';

export const Toggle = React.createClass({
  propTypes: {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    label: PropTypes.any.isRequired,
    disabled: PropTypes.bool.isRequired,
    error: PropTypes.any,
    labelClassName: PropTypes.string,
    inputClassName: PropTypes.string,
  },

  getDefaultProps() {
    return { disabled: false };
  },

  render() {
    const { input, label, disabled, meta: { touched, error } } = this.props;
    return (
      <div className="form-group">
        <label>
          <ReactToggle
            // id={id}
            disabled={disabled}
            checked={input.value}
            onChange={input.onChange}
          />
          <span>
            {label}
          </span>
        </label>
        {touched && error}
      </div>
    );
  },
});

export default Toggle;
