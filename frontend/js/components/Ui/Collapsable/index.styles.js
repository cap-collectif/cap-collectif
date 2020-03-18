// @flow
import styled, { css, type StyledComponent } from 'styled-components';
import { slideInUp } from '~/utils/styles/keyframes';
import type { CollapsableAlignment } from '~ui/Collapsable/index';

export const CollapsableBody: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  animation: ${slideInUp} 0.2s forwards;
  position: absolute;
  top: calc(100% + 10px);
  z-index: 100;
`;

export const Container: StyledComponent<
  { align: CollapsableAlignment },
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
`;

export const Button: StyledComponent<{ visible: boolean }, {}, HTMLDivElement> = styled.div`
  display: flex;
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
