// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

export type Props = {|
  input: {
    onChange: Function,
    value: boolean,
  },
  meta?: { touched: boolean, error: ?string },
  label?: string,
  roledescription?: string,
  disabled?: boolean,
  id?: string,
  labelSide?: 'RIGHT' | 'LEFT',
  className?: string,
|};

export const ToggleWrapper: StyledComponent<
  { disabled?: boolean },
  {},
  HTMLLabelElement,
> = styled.label`
  position: relative;
  display: inline-block;
  width: 35px;
  height: 20px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    opacity: ${({ disabled }) => disabled && '.5'};
    position: absolute;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 20px;
  }

  span:before {
    position: absolute;
    content: '';
    height: 10px;
    width: 10px;
    left: 5px;
    bottom: 5px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + span {
    background-color: ${colors.blue};
  }

  input:focus + span {
    box-shadow: 0 0 1px #2196f3;
  }

  input:checked + span:before {
    transform: translateX(16px);
  }
`;

export const Toggle = ({
  input,
  label,
  id,
  disabled = false,
  roledescription,
  labelSide = 'LEFT',
  meta,
  className = '',
}: Props) => {
  return (
    <div className={`form-group ${className}`}>
      <div style={{ display: 'flex' }}>
        {labelSide === 'RIGHT' && <span className="mr-10">{label}</span>}
        <ToggleWrapper disabled={disabled}>
          <input
            type="checkbox"
            id={id}
            aria-labelledby={label}
            aria-roledescription={roledescription}
            disabled={disabled}
            checked={input?.value}
            onChange={input?.onChange}
          />
          <span className="elegant-toggle" />
        </ToggleWrapper>
        {labelSide === 'LEFT' && <span className="ml-10">{label}</span>}
      </div>
      {meta?.touched && meta?.error}
    </div>
  );
};

export default Toggle;
