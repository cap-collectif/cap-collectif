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

export const UserInfo: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
`;
