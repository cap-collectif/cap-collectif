// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

export const Container: StyledComponent<{}, {}, HTMLElement> = styled.li`
  background: ${colors.white};
  display: flex;
  align-items: center;
  & span {
    padding-left: 20px;
  }
  & svg {
    margin-right: 1rem;
    & + span {
      padding-left: 0;
    }
  }
`;
