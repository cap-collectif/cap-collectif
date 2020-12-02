// @flow
import styled, { css, type StyledComponent } from 'styled-components';
import { slideInUp } from '~/utils/styles/keyframes';
import type { CollapsableAlignment } from '~ui/Collapsable/index';

export const CollapsableBody: StyledComponent<
  { isAbsolute: boolean },
  {},
  HTMLDivElement,
> = styled.div`
  animation: ${slideInUp} 0.2s forwards;
  ${props =>
    props.isAbsolute &&
    css`
      position: absolute;
      top: calc(100% + 10px);
      z-index: 100;
    `}
`;

export const Container: StyledComponent<
  { align: CollapsableAlignment, disabled?: boolean },
  {},
  HTMLDivElement,
> = styled.div`
  display: inline-block;
  position: relative;
  ${props =>
    props.align === 'left' &&
    css`
      & ${/* sc-selector */ CollapsableBody} {
        left: 0;
      }
    `}
  ${props =>
    props.align === 'right' &&
    css`
      & ${/* sc-selector */ CollapsableBody} {
        right: 0;
      }
    `}
  ${props =>
    props.disabled &&
    css`
      opacity: 0.5;
      border: 1px solid #eee;
      background-color: #fff;
    `}
`;

export const Button: StyledComponent<
  { visible: boolean, inline: boolean },
  {},
  HTMLDivElement,
> = styled.div`
  display: ${props => (props.inline ? 'inline-flex' : 'flex')};
  align-items: center;

  > * {
    margin: 0;
  }

  & svg {
    transition: transform 0.2s;
    margin-left: 4px;
  }

  ${props =>
    props.visible &&
    css`
      & svg {
        transform: rotate(-180deg);
      }
    `}

  &:hover {
    cursor: pointer;
  }
`;
