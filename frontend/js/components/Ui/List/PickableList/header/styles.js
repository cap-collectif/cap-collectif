// @flow

import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { Container as PickableListBodyContainer } from '~ui/List/PickableList/body/styles';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';

export const CHECKBOX_CELL_WIDTH = '16px';

// For the sc-selector tag, see https://github.com/styled-components/stylelint-processor-styled-components/issues/81#issuecomment-467765645
// It helps the linter to correctly interprets and parse string litterals

export const Container: StyledComponent<
  { disabled?: boolean },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'pickableList-header',
})`
  position: relative;
  padding: 15px 10px;
  display: flex;
  align-items: center;
  background: ${colors.formBgc};
  ${MAIN_BORDER_RADIUS};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border: 1px solid ${colors.lightGray};
  pointer-events: ${props => props.disabled && 'none'};
  & > input[type='checkbox'] {
    min-width: ${CHECKBOX_CELL_WIDTH};
    max-width: ${CHECKBOX_CELL_WIDTH};
    width: ${CHECKBOX_CELL_WIDTH};
    height: ${CHECKBOX_CELL_WIDTH};
    flex: none;
    align-self: start;
    margin: 0 8px 0 0;
  }
  & + ${/* sc-selector */ PickableListBodyContainer} {
    border-top: none;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
`;

export const Overlay: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'overlay',
})`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  content: '';
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  ${MAIN_BORDER_RADIUS};
  background-color: ${colors.white};
  opacity: 0.5;
  z-index: 100;
`;
