// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;

  & > div {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
`;

export const ButtonUnsubscribe: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  background-color: ${colors.dangerColor};
  color: #fff;
  width: 100%;
  padding: 6px;
  border: none;
  margin-top: 15px;
  ${MAIN_BORDER_RADIUS};
`;
