// @ts-nocheck

import styled from 'styled-components'
import { mediaQueryMobile } from '~/utils/sizes'

export const Container = styled.div.attrs({
  className: 'global-step-list',
})`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;

  .global-step-item {
    width: 30%;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    flex-direction: column;

    .global-step-item {
      width: 100%;
      margin-bottom: 30px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
`
