// @flow
import React, { Component } from 'react';
import { ToggleButtonGroup } from 'react-bootstrap';

type Props = {
  type: 'radio' | 'checkbox',
  disabled: boolean,
  onChange: Function,
  value: any,
  name: string,
  children: any,
};

class ButtonGroup extends Component<Props, void> {
  static defaultProps = {
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
          onChange(val);
        }}
        disabled={disabled}>
        {children}
      </ToggleButtonGroup>
    );
  }
}

export default ButtonGroup;
