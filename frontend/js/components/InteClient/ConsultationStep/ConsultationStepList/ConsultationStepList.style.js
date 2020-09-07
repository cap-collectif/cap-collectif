// @flow
import styled, { type StyledComponent } from 'styled-components';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;

  .consultation-step-item {
    width: 50%;
    margin-bottom: 50px;
  }
`;
