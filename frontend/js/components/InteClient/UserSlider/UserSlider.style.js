// @flow
import styled, { type StyledComponent } from 'styled-components';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  overflow-x: scroll;

  .user-slide {
    width: 22%;
    flex-shrink: 0;
  }
`;
