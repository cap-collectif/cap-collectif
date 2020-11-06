// @flow
import styled, { type StyledComponent } from 'styled-components';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 60px;

  h2 {
    font-size: 18px;
    font-weight: bold;
    color: #000;
    margin: 0 0 30px 0;
  }
`;

export const Header: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;
