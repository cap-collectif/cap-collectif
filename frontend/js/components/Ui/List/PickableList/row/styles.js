// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { CHECKBOX_CELL_WIDTH } from '~ui/List/PickableList/header/styles';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'pickableList-row',
})`
  padding: 10px;
  display: flex;
  flex-direction: row;
  background: ${colors.white};
  border-bottom: 1px solid ${colors.lightGray};
  &:last-of-type {
    border-bottom: none;
  }
  & > input[type='checkbox'] {
    min-width: ${CHECKBOX_CELL_WIDTH};
    max-width: ${CHECKBOX_CELL_WIDTH};
    width: ${CHECKBOX_CELL_WIDTH};
    flex: none;
  }
`;

export const ChildWrapper: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'pickableList-row-content',
})``;
