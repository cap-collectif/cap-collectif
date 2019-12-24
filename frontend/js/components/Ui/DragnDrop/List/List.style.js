// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { mediaQueryMobile } from '~/utils/sizes';

const widthItemPosition = 30;
const marginItemPosition = 20;
const spaceItemPosition = widthItemPosition + marginItemPosition;

const ListContainer: StyledComponent<
  { hasPositionDisplayed?: boolean },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'list-dragndrop',
})`
  .wrapper-item-container {
    position: relative;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .title {
    font-size: 16px;
    color: ${colors.darkGray};
    margin: ${props =>
      props.hasPositionDisplayed ? `0 0 10px ${spaceItemPosition}px` : '0 0 10px 0'};
  }

  @media (max-width: ${mediaQueryMobile}) {
    & + .list-dragndrop {
      margin-top: 15px;
    }
  }
`;

export const ListItemContainer: StyledComponent<{}, {}, HTMLLIElement> = styled.li.attrs({})`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;

  .item__position {
    width: ${widthItemPosition}px;
    height: 23px;
    line-height: 23px;
    margin-top: 10px;
    margin-right: ${marginItemPosition}px;
    text-align: center;
    background-color: ${colors.primaryColor};
    color: #fff;
    border-radius: 20px;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export default ListContainer;
