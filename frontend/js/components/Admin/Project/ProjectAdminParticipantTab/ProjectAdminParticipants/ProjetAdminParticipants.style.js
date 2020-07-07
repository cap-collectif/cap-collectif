// @flow
import styled, { type StyledComponent } from 'styled-components';

export const HeaderContainer: StyledComponent<{}, {}, HTMLElement> = styled.header`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 1rem 0;
`;
