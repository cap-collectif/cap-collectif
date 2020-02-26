// @flow

import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { Container as PickableListBodyContainer } from '~ui/List/PickableList/body/styles';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';

export const CHECKBOX_CELL_WIDTH = '24px';

// For the sc-selector tag, see https://github.com/styled-components/stylelint-processor-styled-components/issues/81#issuecomment-467765645
// It helps the linter to correctly interprets and parse string litterals

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 15px 10px;
  display: flex;
  background: ${colors.formBgc};
  ${MAIN_BORDER_RADIUS};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border: 1px solid ${colors.lightGray};
  & > * {
    margin: 0 1.25rem 0 0;
    justify-content: flex-end;
    &:first-of-type {
      flex: 3;
    }
  }
  & > input[type='checkbox'] {
    min-width: ${CHECKBOX_CELL_WIDTH};
    max-width: ${CHECKBOX_CELL_WIDTH};
    width: ${CHECKBOX_CELL_WIDTH};
    margin-top: 4px;
  }
  & + ${/* sc-selector */ PickableListBodyContainer} {
    border-top: none;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  & ul {
    list-style: none;
    display: inline-flex;
  }
`;
