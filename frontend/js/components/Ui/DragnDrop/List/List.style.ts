import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import colors from '~/utils/colors'
import { mediaQueryMobile } from '~/utils/sizes'

const getWidthItemPosition = isMobile => (isMobile ? 40 : 30)

const getWidthItemPointPosition = isMobile => (isMobile ? 40 : 52)

const marginItemPosition = 20
export const spaceItemPosition = getWidthItemPosition(false) + marginItemPosition + 1
const ListContainer = styled.div.attrs({
  className: 'list-dragndrop',
})<{
  hasPositionDisplayed?: boolean
}>`
  width: 100%;

  .wrapper-item-container {
    position: relative;
    list-style: none;
    padding: 0;
    margin: 0;
    overflow: auto;
  }

  .title {
    font-size: 16px;
    color: ${colors.darkGray};
    margin: ${props => (props.hasPositionDisplayed ? `0 0 10px ${spaceItemPosition}px` : '0 0 10px 0')};
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    & + .list-dragndrop {
      margin-top: 15px;
    }
  }
`
export const ListItemContainer: StyledComponent<any, {}, HTMLLIElement> = styled.li.attrs({})`
  position: relative;
  display: flex;
  flex-direction: row !important;
  align-items: center;
  margin-bottom: 10px;

  .item__position__point {
    width: ${getWidthItemPointPosition(false)}px;
    height: 23px;
    line-height: 24px;
    font-size: 10px;
    margin-top: 10px;
    margin-right: ${marginItemPosition}px;
    text-align: center;
    background-color: ${colors.primaryColor};
    color: #fff;
    border-radius: 10px;
    b {
      font-size: 14px;
      line-height: 19px;
    }
  }

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    .item__position {
      width: ${getWidthItemPosition(true)}px;
    }
  }
`
export default ListContainer
