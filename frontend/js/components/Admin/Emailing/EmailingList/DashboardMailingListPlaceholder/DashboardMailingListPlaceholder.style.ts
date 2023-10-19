import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import PickableList from '~ui/List/PickableList'
import { blink } from '~/utils/styles/keyframes'

export const Header: StyledComponent<any, {}, HTMLElement> = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin: 1rem 2rem;
`
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
