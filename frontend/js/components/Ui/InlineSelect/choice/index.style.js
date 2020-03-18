// @flow
import styled, { css, type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

export const Container: StyledComponent<{ active: boolean }, {}, HTMLElement> = styled.li`
  &:hover {
    cursor: pointer;
  }

  ${props =>
    props.active &&
    css`
      color: ${colors.primaryColor};
      font-weight: 600;
    `}
`;
