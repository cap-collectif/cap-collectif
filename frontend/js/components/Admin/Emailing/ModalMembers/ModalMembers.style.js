// @flow
import styled, { type StyledComponent } from 'styled-components';

export const MembersContainer: StyledComponent<{}, {}, HTMLUListElement> = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    margin-bottom: 10px;
  }
`;
