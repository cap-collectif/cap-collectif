// @flow
import styled, { type StyledComponent } from 'styled-components';
import {
  LIGHT_BOX_SHADOW,
  MAIN_BORDER_RADIUS,
  MAIN_BORDER_RADIUS_SIZE,
} from '~/utils/styles/variables';
import colors from '~/utils/colors';

export const CONTAINER_WIDTH = '300px';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  ${MAIN_BORDER_RADIUS};
  border: 1px solid ${colors.lightGray};
  background: ${colors.white};
  max-height: 400px;
  max-width: ${CONTAINER_WIDTH};
  width: ${CONTAINER_WIDTH};
  position: relative;
  font-weight: 600;
  ${LIGHT_BOX_SHADOW};
  & > * {
    border-top-left-radius: ${MAIN_BORDER_RADIUS_SIZE};
    border-top-right-radius: ${MAIN_BORDER_RADIUS_SIZE};
  }
  & li {
    padding: 10px;
    background: ${colors.white};
    & + li {
      border-top: 1px solid ${colors.lightGray};
    }
    &:last-of-type {
      border-bottom-left-radius: ${MAIN_BORDER_RADIUS_SIZE};
      border-bottom-right-radius: ${MAIN_BORDER_RADIUS_SIZE};
    }
    &:hover,
    :active {
      cursor: pointer;
      background: ${colors.paleGrey};
    }
  }
`;

export const Header: StyledComponent<{}, {}, HTMLElement> = styled.header`
  background: ${colors.paleGrey};
  padding: 10px;
  border-bottom: 1px solid ${colors.lightGray};
`;

export const Body: StyledComponent<{}, {}, HTMLUListElement> = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-direction: column;
  width: 100%;
`;
