import React, { PropTypes } from 'react';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';

const ButtonGroup = React.createClass({
  propTypes: {
    id: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      disabled: false,
      labelClassName: '',
    };
  },

  render() {
    const { disabled, onChange, value } = this.props;
    return (
      <ToggleButtonGroup
        type="radio"
        value={value}
        onChange={onChange}
        disabled={disabled}>
        <ToggleButton value={1}>Checkbox 1 (pre-checked)</ToggleButton>
        <ToggleButton value={2}>Checkbox 2</ToggleButton>
        <ToggleButton value={3}>Checkbox 3 (pre-checked)</ToggleButton>
      </ToggleButtonGroup>
    );
  },
});

export default ButtonGroup;
