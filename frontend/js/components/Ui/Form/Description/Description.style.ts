import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'

const DescriptionContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div.attrs({
  className: 'form-description',
})`
  font-size: 16px;
  color: #333;
  margin-bottom: 12px;
`
export default DescriptionContainer
