import styled, { css } from 'styled-components'
import colors from '~/utils/colors'

export const Container = styled.li<{
  active: boolean
}>`
  &:hover {
    cursor: pointer;
  }

  ${props =>
    props.active &&
    css`
      color: ${colors.primaryColor};
      font-weight: 600;
    `}
`
