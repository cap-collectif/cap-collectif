import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'

const QuestionContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div.attrs({
  className: 'question',
})`
  font-size: 20px;
  font-weight: 600;
  color: #333;
`
export default QuestionContainer
