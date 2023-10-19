// @ts-nocheck
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'

export type Colors = {
  line: string
}
export const Container: StyledComponent<
  {
    lineColor: string
  },
  {},
  HTMLDivElement
> = styled.div.attrs({
  className: 'global-step-item',
})`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 16px;

  & > div {
    position: relative;
    z-index: 1;
    font-weight: bold;
    font-size: 20px;
    margin-bottom: 16px;
  }

  .title {
    font-size: 24px;
  }

  .line {
    position: absolute;
    left: -5px;
    top: 21px;
    z-index: -1;
    width: 55px;
    height: 8px;
    background-color: ${props => props.lineColor};
  }
`
