// @flow
import styled, { type StyledComponent } from 'styled-components';

const QuestionContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'question',
})`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
`;

export default QuestionContainer;
