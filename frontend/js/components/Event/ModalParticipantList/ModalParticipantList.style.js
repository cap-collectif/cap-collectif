// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';

export const Container: StyledComponent<{}, {}, HTMLLIElement> = styled.li.attrs({
  className: 'participant',
})`
  display: flex;
  flex-direction: row;
  background-color: #fff;
  padding: 10px 15px;
  border: 1px solid ${colors.borderColor};
  ${MAIN_BORDER_RADIUS};
`;

export const List: StyledComponent<{}, {}, HTMLUListElement> = styled.ul`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0;
  margin: 0;

  .participant {
    margin-bottom: 15px;
    flex: 0 0 48%;
  }
`;
