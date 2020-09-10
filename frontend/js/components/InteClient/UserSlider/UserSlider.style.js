// @flow
import styled, { type StyledComponent } from 'styled-components';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'user-slider',
})`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  overflow-x: scroll;

  .user-slide {
    margin-right: 40px;
    flex: 1 0 auto;
  }
`;
