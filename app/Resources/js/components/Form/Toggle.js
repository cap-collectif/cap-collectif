// @flow
import React, { PropTypes } from 'react';
import ReactToggle from 'react-toggle';

export const Toggle = React.createClass({
  propTypes: {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    label: PropTypes.any.isRequired,
    // id: PropTypes.string.isRequired,
    error: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    labelClassName: PropTypes.string,
    inputClassName: PropTypes.string,
  },

  render() {
    const {
      onChange,
      input,
      label,
      // labelClassName,
      // inputClassName,
      meta: { touched, error },
      // ...custom
    } = this.props;
    return (
      <div className="form-group">
        <label>
          <ReactToggle
            // id={id}
            checked={input.value}
            onChange={onChange}
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
