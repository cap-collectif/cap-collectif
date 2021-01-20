// @flow
import styled, { type StyledComponent } from 'styled-components';

export const CommentBottom: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  align-items: center;
  margin: 10px;

  button {
    margin-right: 10px;
  }
`;
