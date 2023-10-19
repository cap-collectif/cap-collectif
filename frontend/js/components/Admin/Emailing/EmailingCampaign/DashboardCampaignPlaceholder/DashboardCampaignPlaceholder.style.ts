import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import colors from '~/utils/colors'
import PickableList from '~ui/List/PickableList'
import { blink } from '~/utils/styles/keyframes'

export const Header: StyledComponent<any, {}, HTMLElement> = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 2rem;

  > div {
    display: flex;
    flex-direction: row;

    &:first-of-type {
      opacity: 0.5;
    }
  }

  span {
    margin-right: 10px;
  }
`
export const Tab: StyledComponent<any, any> = styled.span<{
  selected: boolean
}>`
  color: ${props => (props.selected ? colors.primaryColor : '#000')};
  font-weight: ${props => (props.selected ? 600 : 400)};
`
export const PickableContainer: StyledComponent<any, {}, typeof PickableList> = styled(PickableList)``
export const PickableHeader: StyledComponent<any, {}, typeof PickableList.Header> = styled(PickableList.Header)`
  justify-content: flex-end;
`
export const ContentContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  background-color: #fff;
`
export const Item: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  padding: 15px;
  animation: ${blink} 0.6s linear infinite alternate;
`
