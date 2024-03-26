// @ts-nocheck

import styled from 'styled-components'
import { mediaQueryMobile } from '~/utils/sizes'

export const Container = styled.div.attrs({
  className: 'debate-preview-list',
})`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;

  .debate-preview-item {
    width: 32%;
    margin-bottom: 50px;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    .debate-preview-item {
      width: 100%;
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
`
