// @flow
import * as React from 'react';
import { ToggleButtonGroup } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';
import cn from 'classnames';

type Props = {
  type: 'radio' | 'checkbox',
  disabled: boolean,
  onChange: Function,
  value: any,
  name: string,
  children: any,
  className?: string,
};

export const Container: StyledComponent<
  { disabled: boolean },
  {},
  typeof ToggleButtonGroup,
> = styled(ToggleButtonGroup)`
  &.disabled {
    pointer-events: none;
    cursor: not-allowed;
  }
`;

const ButtonGroup = ({
  type,
  disabled = false,
  onChange,
  value,
  name,
  children,
  className,
}: Props) => (
  <Container
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={cn(className, { disabled })}>
    {children}
  </Container>
);

export default ButtonGroup;
