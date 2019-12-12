// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '../../../../utils/colors';

const LabelContainer: StyledComponent<{}, {}, HTMLParagraphElement> = styled.p`
  margin: 0 0 0 15px;
  font-weight: 600;
  font-size: 16px;
  color: ${colors.darkText};
`;

export default LabelContainer;
