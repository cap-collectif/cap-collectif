// @flow
import styled, { css, type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

export const Container: StyledComponent<{ isDisabled: boolean }, {}, HTMLElement> = styled.li`
  background: ${colors.white};
  display: flex;
  align-items: center;
  &:hover,
  :active {
    cursor: pointer;
    background: ${colors.paleGrey};
  }

  ${props =>
    props.isDisabled &&
    css`
      background: ${colors.paleGrey};
      filter: grayscale(100%);
      &:hover {
        cursor: not-allowed;
      }
      user-select: none;
    `}
  & span {
    padding-left: 20px;
  }
  & svg {
    margin-right: 1rem;
    min-width: 10px;
    & + span {
      padding-left: 0;
    }
  }
`;
