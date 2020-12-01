// @flow
import styled, { type StyledComponent } from 'styled-components';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import colors from '~/utils/colors';

export const InstructionContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px;
  text-align: center;
  background-color: ${colors.pageBgc};
  ${MAIN_BORDER_RADIUS};

  p {
    width: 70%;
    line-height: 1.5;
  }
`;

export const InfoMailingList: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const InfoRow: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;

  p {
    margin: 0;
    font-weight: 600;

    & + p {
      margin-left: 10px;
    }
  }

  .icon {
    margin-right: 5px;
  }
`;

export const ButtonMembers: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  padding: 8px;
  background-color: ${colors.blue};
  color: #fff;
  border: none;
  ${MAIN_BORDER_RADIUS};
  margin-bottom: 15px;
`;
