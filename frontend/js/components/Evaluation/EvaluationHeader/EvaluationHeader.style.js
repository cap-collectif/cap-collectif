// @flow
import styled, { type StyledComponent } from 'styled-components';

const EvaluationHeaderContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'jumbotron--custom  jumbotron--bg-1',
})`
  display: flex;
  align-items: center;
  justify-content: center;

  h1 {
    font-size: 36px;
    margin: auto;
  }
`;

export default EvaluationHeaderContainer;
