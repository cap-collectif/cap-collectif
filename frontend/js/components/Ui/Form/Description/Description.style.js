// @flow
import styled, { type StyledComponent } from 'styled-components';

const DescriptionContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'form-description',
})`
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
`;

export default DescriptionContainer;
