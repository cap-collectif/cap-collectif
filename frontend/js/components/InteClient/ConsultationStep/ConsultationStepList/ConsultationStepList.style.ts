// @ts-nocheck

import styled from 'styled-components'
import { mediaQueryMobile } from '~/utils/sizes'

export const Container: StyledComponent<
  {
    columnHeight: string
  },
  {},
  HTMLDivElement
> = styled.div.attrs({
  className: 'consultation-step-list',
})`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  max-height: ${props => props.columnHeight};

  .consultation-step-item {
    width: 42%;
    margin-bottom: 50px;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    max-height: initial;

    .consultation-step-item {
      width: 100%;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
`
