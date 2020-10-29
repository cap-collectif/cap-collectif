// @flow
import styled, { type StyledComponent } from 'styled-components';

export const Container: StyledComponent<{ color: string }, {}, HTMLDivElement> = styled.div.attrs({
  className: 'label-state',
})`
  display: flex;
  flex-direction: row;
  align-items: center;
  color: ${props => props.color};
  font-weight: 600;

  .pin {
    width: 15px;
    height: 15px;
    border-radius: 7.5px;
    background-color: ${props => props.color};
    margin-right: 4px;
  }
`;
