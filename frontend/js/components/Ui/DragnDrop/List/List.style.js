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
  position: relative;
  list-style: none;
  padding: 0;
  margin: 0;
  padding-left: ${props => props.hasPositionDisplayed && '50px'};

  .title {
    font-size: 16px;
    color: ${colors.darkGray};
    margin: 0 0 10px 0;
  }

  & + .list-dragndrop {
    margin-top: 15px;
  }
`;

export const ListItemContainer: StyledComponent<{}, {}, HTMLLIElement> = styled.li.attrs({})`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;

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
    margin-bottom: 0;
  }
`;

export default ListContainer;
