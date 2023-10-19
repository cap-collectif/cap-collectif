// @ts-nocheck
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'

export type Colors = {
  primary: string
  secondary: string
}
export const Container: StyledComponent<any, {}, HTMLDivElement> = styled.div.attrs({
  className: 'consultation-step-item',
})`
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  & > div {
    display: flex;
    flex-direction: column;
  }

  .title,
  .date {
    margin: 0;
  }

  .title {
    font-size: 18px;
  }

  .date {
    color: #6b7885;
    font-weight: bold;
    margin-top: 2px;
  }
`
export const Number: StyledComponent<
  {
    colors: Colors
  },
  {},
  HTMLParagraphElement
> = styled.p`
  position: relative;
  z-index: 1;
  color: ${props => props.colors.primary};
  margin: 0 20px 0 0;
  font-size: 24px;
  font-weight: bold;

  .line {
    position: absolute;
    left: 0;
    bottom: 6px;
    z-index: -1;
    width: 20px;
    height: 8px;
    background-color: ${props => props.colors.secondary};
  }
`
