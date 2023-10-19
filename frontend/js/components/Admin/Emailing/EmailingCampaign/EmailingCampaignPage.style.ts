import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'

export const Container: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
`
export const Header: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #fff;
  color: #000;

  h2 {
    font-size: 18px;
    margin: 0;
    font-weight: 600;
  }
`
export const Content: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  padding: 20px;
`
