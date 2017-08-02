import React, { Component } from 'react';
import { ToggleButtonGroup } from 'react-bootstrap';

type Props = {
  type: 'radio' | 'checkbox',
  disabled: Boolean,
  onChange: Function,
  value: any,
  name: String,
  children: any,
};

class ButtonGroup extends Component<void, Props, void> {
  static defaultProps: {
    disabled: false,
  };

  render() {
    const { type, disabled, onChange, value, name, children } = this.props;
    return (
      <ToggleButtonGroup
        type={type}
        name={name}
        value={value}
        onChange={val => {
          console.log(val);
          onChange(val);
        }}
        disabled={disabled}>
        {children}
      </ToggleButtonGroup>
    );
  }
}

export default ButtonGroup;
