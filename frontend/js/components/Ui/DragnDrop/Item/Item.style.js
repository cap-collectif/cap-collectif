// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

const ItemContainer: StyledComponent<
  { isEmpty?: boolean, hasPositionDisplayed?: boolean },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'list__item',
})`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  background-color: #fafafa;
  border: 1px solid #ddd;
  height: 40px;
  width: 372px;
  padding: 0 15px;
  border-radius: 4px;
  border-style: ${props => props.isEmpty && 'dashed'};
  background-color: ${props => props.isEmpty && '#fff'};

  .cap-android-menu {
    color: ${colors.iconGrayColor};
    font-size: 20px;
  }
`;

export default ItemContainer;
