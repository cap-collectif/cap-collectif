// @flow
import styled, { type StyledComponent } from 'styled-components';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;

  .instruction-container {
    margin-bottom: 15px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const InstructionContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'instruction-container',
})`
  display: flex;
  align-items: center;
  flex-direction: row;
  font-size: 18px;

  .text-container {
    display: flex;
    flex-direction: column;
  }

  p {
    margin: 0;
  }

  .main-text {
    font-weight: bold;
  }
`;

export const IconContainer: StyledComponent<
  { backgroundColor: string },
  {},
  HTMLDivElement,
> = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.backgroundColor};
  width: 40px;
  height: 40px;
  border-radius: 8px;
  margin-right: 15px;
`;
