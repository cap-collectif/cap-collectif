// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';

export const DateLiveContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 15px 20px;
  background-color: ${colors.darkGray};
  color: #fff;
  ${MAIN_BORDER_RADIUS};

  .icon-rounded {
    margin-right: 10px;
  }
`;

export const Date: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ButtonJoin: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  position: absolute;
  left: 15px;
  bottom: 15px;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 10px;
  border: none;
  font-size: 12px;
  background-color: ${colors.lightBlue};
  color: #fff;
  ${MAIN_BORDER_RADIUS};

  .icon-rounded {
    margin-right: 10px;
  }
`;
