import styled, { css } from 'styled-components'
import colors from '~/utils/colors'

export const Container = styled.li<{
  isDisabled: boolean
}>`
  background: ${colors.white};
  display: flex;
  align-items: center;
  font-size: 12px;
  &:hover,
  :active {
    cursor: pointer;
    background: ${colors.paleGrey};
  }

  ${props =>
    props.isDisabled &&
    css`
      background: ${colors.paleGrey};
      user-select: none;
      &:hover {
        cursor: not-allowed;
      }

      & > span *:not(svg) {
        filter: grayscale(100%);
      }
    `}
  & > span {
    padding-left: 20px;
    color: ${colors.darkGray};
    font-weight: normal;
  }
  & > svg {
    margin-right: 1rem;
    min-width: 10px;
    & + span {
      padding-left: 0;
      color: #000;
      font-weight: bold;
    }
  }
`
