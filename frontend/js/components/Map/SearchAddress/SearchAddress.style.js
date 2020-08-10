// @flow
import styled, { type StyledComponent, css } from 'styled-components';
import colors from '~/utils/colors';
import { BASE_INPUT, MAIN_BORDER_RADIUS_SIZE } from '~/utils/styles/variables';

export const Container: StyledComponent<{ isMobile?: boolean }, {}, HTMLDivElement> = styled.div`
  position: absolute;
  top: 15px;
  ${({ isMobile }) => (isMobile ? 'right: 15px' : 'left: 15px')};
  display: flex;
  justify-content: center;
  flex-direction: column;
  z-index: 400;
`;

export const SearchContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;

  .icon-search {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
  }

  input {
    ${BASE_INPUT};
    padding-left: 30px;
    border-radius: ${MAIN_BORDER_RADIUS_SIZE} 0 0 ${MAIN_BORDER_RADIUS_SIZE};
  }
`;

export const ButtonLocation: StyledComponent<
  { isMobile?: boolean },
  {},
  HTMLButtonElement,
> = styled.button`
  background-color: #fafafa;
  border: 1px solid ${colors.lightGray};
  ${({ isMobile }) =>
    isMobile
      ? css`
          border-radius: ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE}
            ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE};
        `
      : css`
          border-radius: 0 ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE} 0;
        `};
  border-left: ${({ isMobile }) => !isMobile && 'none'};
  padding: 0 10px;
  height: ${({ isMobile }) => isMobile && '35px'};
`;

export const ResultContainer: StyledComponent<{}, {}, HTMLUListElement> = styled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #fff;
  list-style: none;
  margin: 0;
  padding: 0;
  border-radius: 0 0 ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE};
  border: 1px solid ${colors.lightGray};
  border-top: none;
`;

export const Result: StyledComponent<{}, {}, HTMLLIElement> = styled.li`
  button {
    text-align: left;
    background: none;
    border: none;
    height: 100%;
    width: 100%;
    padding: 6px;
  }
`;
