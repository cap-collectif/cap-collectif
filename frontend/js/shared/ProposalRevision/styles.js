// @flow
import styled, { type StyledComponent } from 'styled-components';
import { styleGuideColors } from '~/utils/colors';

export const RevisionButton: StyledComponent<
  { disabled?: boolean },
  {},
  HTMLButtonElement,
> = styled.button`
  width: 100%;
  text-align: center;
  background: transparent;
  color: ${styleGuideColors.blue500};
  font-size: 14px;
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 16px;
  border: none;
  opacity: ${({ disabled }) => disabled && '0.5'};
`;
