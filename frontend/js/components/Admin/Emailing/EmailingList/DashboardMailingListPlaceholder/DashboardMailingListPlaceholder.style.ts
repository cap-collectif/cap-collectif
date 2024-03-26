import styled from 'styled-components'
import PickableList from '~ui/List/PickableList'
import { blink } from '~/utils/styles/keyframes'

export const Header = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin: 1rem 2rem;
`
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
