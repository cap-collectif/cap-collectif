// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

const ListContainer: StyledComponent<
  { hasPositionDisplayed?: boolean },
  {},
  HTMLUListElement,
> = styled.ul.attrs({
  className: 'list-dragndrop',
})`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  list-style: none;
  padding: 0;
  margin: 0;
  padding-left: ${props => props.hasPositionDisplayed && '50px'};

  .title {
    font-size: 16px;
    color: ${colors.darkGray};
    margin: 0 0 10px 0;
  }
`;

export const ListItemContainer: StyledComponent<{}, {}, HTMLLIElement> = styled.li.attrs({})`
  position: relative;
  display: flex;
  flex-direction: row;

  .item__position {
    position: absolute;
    left: -50px;
    top: 50%;
    transform: translateY(-50%);
    width: 30px;
    height: 23px;
    line-height: 23px;
    text-align: center;
    background-color: ${colors.primaryColor};
    color: #fff;
    border-radius: 20px;
  }

  &:last-child {
    .list__item {
      margin-bottom: 0;
    }
  }
`;

export default ListContainer;
