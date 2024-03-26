import styled, { css } from 'styled-components'
import { mediaQueryMobile } from '~/utils/sizes'
import { LIGHT_BOX_SHADOW, MAIN_BORDER_RADIUS, MAIN_BORDER_RADIUS_SIZE } from '~/utils/styles/variables'
import colors from '~/utils/colors'
import type { DropdownSelectPointing } from '~ui/DropdownSelect/menu/index'

const SPACE_BETWEEN_SUBPANELS = '6px'
export const ContainerInner = styled.div`
  display: flex;
  align-items: center;
  & > svg {
    margin-left: auto;
  }
`
export const ListContainer = styled.div`
  display: none;
`
export const Container = styled.li<{
  pointing: DropdownSelectPointing
}>`
  position: relative;
  background: ${colors.white};
  & li {
    display: none;
  }
  &:hover,
  :active {
    cursor: pointer;
    background: ${colors.paleGrey};
  }
  &:hover,
  :active,
  :focus {
    & > ${ListContainer} {
      padding: 0;
      display: block;
      position: absolute;
      min-width: 100%;
      background: transparent;
      top: 40px;
      left: 0;
      right: 0;
      @media screen and (min-width: ${mediaQueryMobile.minWidth}) {
        min-width: 200px;
        top: -1px;
        ${props =>
          props.pointing === 'right' &&
          css`
            padding: 0 0 0 ${SPACE_BETWEEN_SUBPANELS};
            left: 100%;
          `};
        ${props =>
          props.pointing === 'left' &&
          css`
            padding: 0 ${SPACE_BETWEEN_SUBPANELS} 0 0;
            right: 0;
            transform: translateX(-100%);
          `};
      }

      z-index: 1;

      & > ul {
        ${LIGHT_BOX_SHADOW};
        ${MAIN_BORDER_RADIUS};
        border: 1px solid ${colors.lightGray};
        padding: 0;
        ${props =>
          props.pointing === 'left' &&
          css`
            float: right;
          `};
      }

      & > ul > li {
        display: block;
      }

      & > ul > *:first-of-type {
        border-top-left-radius: ${MAIN_BORDER_RADIUS_SIZE};
        border-top-right-radius: ${MAIN_BORDER_RADIUS_SIZE};
      }

      & > ul > *:last-of-type {
        border-bottom-left-radius: ${MAIN_BORDER_RADIUS_SIZE};
        border-bottom-right-radius: ${MAIN_BORDER_RADIUS_SIZE};
      }
    }
  }
`
