// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { mediaQueryMobile } from '~/utils/sizes';

const ItemContainer: StyledComponent<
  { isEmpty?: boolean, hasPositionDisplayed?: boolean, isDraggingOver?: boolean },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'list__item',
})`
  display: flex;
  align-items: flex-start;
  background-color: #fafafa;
  border: 1px solid #ddd;
  width: 372px;
  min-height: 46px;
  padding: 8px 15px;
  border-radius: 4px;
  border-style: ${props => props.isEmpty && 'dashed'};
  background-color: ${props => props.isEmpty && '#fff'};

  .cap-android-menu {
    color: ${colors.iconGrayColor};
    font-size: 20px;
    margin-right: 15px;
  }

  .btn-remove-choice {
    background: none;
    border: none;
    margin-left: auto;
    padding: 0;
  }

  @media (max-width: ${mediaQueryMobile}) {
    width: 100%;
    justify-content: space-between;

    .cap-android-menu {
      order: 3;
      margin-left: 15px;
      margin-right: 0;
    }

    .btn-remove-choice {
      order: -1;
      margin-right: 15px;
    }
  }
`;

export default ItemContainer;
