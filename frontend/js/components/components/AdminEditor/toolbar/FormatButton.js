// @flow
import { type ComponentType } from 'react';
import styled, { css } from 'styled-components';

const hoverStyle = css`
  &:hover:not(:disabled) {
    background-color: rgba(204, 204, 204, 0.2);

    svg {
      fill: hsl(201, 82%, 55%);
    }
  }
`;

const activeStyle = css`
  background-color: hsla(201, 82%, 55%, 0.2) !important;

  svg {
    fill: hsl(201, 82%, 40%) !important;
  }
`;

type FormatButtonProps = {
  title?: ?string,
  shortcut?: ?string,
  active?: boolean,
  tabIndex?: string,
  onClick?: (event: SyntheticMouseEvent<HTMLButtonElement>) => void | string,
};

const FormatButton: ComponentType<FormatButtonProps> = styled('button').attrs(props => ({
  'aria-label': props.title,
  title: props.title ? `${props.title} ${props.shortcut ? `(${props.shortcut})` : ''}` : '',
}))`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  cursor: pointer;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 1px;
  padding: 3px;
  font-size: 16px;
  font-weight: 700;
  transition: background-color 0.1s ease-in;

  svg {
    fill: #333;
  }

  ${({ active }) => (active ? activeStyle : hoverStyle)}

  &:focus {
    outline: none;
    ${activeStyle}
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

export default FormatButton;
