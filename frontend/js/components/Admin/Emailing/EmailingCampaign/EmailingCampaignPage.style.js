// @flow
import styled, { type StyledComponent } from 'styled-components';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Header: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 20px;
  background-color: #fff;
  color: #000;

  h2 {
    font-size: 18px;
    margin: 0;
    font-weight: 600;
  }
`;

export const Content: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 20px;
`;
