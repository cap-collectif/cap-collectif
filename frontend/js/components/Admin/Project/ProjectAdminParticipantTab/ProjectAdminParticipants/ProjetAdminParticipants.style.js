// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

export const HeaderContainer: StyledComponent<{}, {}, HTMLElement> = styled.header`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 1rem 0;
`;

export const ButtonSendMail: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  color: ${colors.darkGray};
  font-weight: bold;

  .icon {
    margin-right: 4px;
  }
`;
