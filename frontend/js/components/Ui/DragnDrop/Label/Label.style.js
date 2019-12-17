// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '../../../../utils/colors';

const LabelContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'label__dnd',
})`
  font-weight: 600;
  font-size: 16px;
  color: ${colors.darkText};
`;

export default LabelContainer;
