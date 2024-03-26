import styled from 'styled-components'
import PickableList from '~ui/List/PickableList'
import colors, { styleGuideColors } from '~/utils/colors'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'

export const MediaRow = styled(PickableList.Row)`
  display: flex;
  flex: 1;
  font-size: 11px;
  color: ${styleGuideColors.darkGray};

  .pickableList-row-content {
    display: flex;
  }
`
export const MediaColumn = styled.div<{
  size: number
}>`
  width: ${props => `${props.size}px`};
  text-align: center;

  button.delete {
    background: none;
    border: none;
    outline: none;
    font-weight: 600;
    padding: 0;
    color: ${styleGuideColors.red};
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`
export const MediaColumnImage = styled(MediaColumn)`
  text-align: left;

  > div:first-child {
    display: flex;
    align-items: center;

    div {
      margin-right: 8px;
    }
  }

  > div:nth-child(2) {
    display: none;
  }

  button {
    background: none;
    border: none;
    outline: none;
    font-weight: 600;
    padding: 0;
    color: ${colors.blue};
  }

  button.delete {
    color: ${styleGuideColors.red};
    margin-top: 5px;
  }

  &:hover {
    > div:nth-child(2) {
      display: block;
    }

    > div:nth-child(2) span {
      margin-left: 5px;
      margin-right: 5px;
      color: ${colors.lightGray};
      font-size: 16px;
    }
  }

  img {
    ${MAIN_BORDER_RADIUS};
    height: 32px;
    width: 40px;
    object-fit: cover;
    margin-right: 8px;
  }
`
export const MediaHeaderList = styled(PickableList.Header)`
  text-transform: uppercase;
  font-size: 11px;
  color: ${styleGuideColors.gray};
  font-weight: 600;
  display: flex;
  flex: 1;

  > input + div {
    text-align: left;
  }
`
export const MediaListHead = styled.div`
  width: calc(100% - 230px);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
  height: 60px;
  position: fixed;
  background: ${colors.white};
  z-index: 1;
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;

  @media (max-width: 768px) {
    width: 100%;
    position: absolute;
  }

  button {
    background: none;
    border: none;
    outline: none;
    padding: 0;
    color: #001b38;

    svg {
      margin-right: 5px;
    }
  }
`
export const ListContainer = styled.div`
  margin: 25px;
  margin-top: 85px;

  .pickableList-row {
    height: 72px;
  }
`
