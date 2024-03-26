import styled from 'styled-components'
import colors from '~/utils/colors'
import PickableList from '~ui/List/PickableList'
import { blink } from '~/utils/styles/keyframes'

export const Header = styled.header`
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
export const Tab = styled.span<{
  selected: boolean
}>`
  color: ${props => (props.selected ? colors.primaryColor : '#000')};
  font-weight: ${props => (props.selected ? 600 : 400)};
`
export const PickableContainer = styled(PickableList)``
export const PickableHeader = styled(PickableList.Header)`
  justify-content: flex-end;
`
export const ContentContainer = styled.div`
  background-color: #fff;
`
export const Item = styled.div`
  padding: 15px;
  animation: ${blink} 0.6s linear infinite alternate;
`
