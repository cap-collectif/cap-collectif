import styled, { css } from 'styled-components'
import { MAIN_BORDER_RADIUS_SIZE } from '~/utils/styles/variables'
import { mediaQueryMobile } from '~/utils/sizes'
import colors from '~/utils/colors'

export const ChoicesContainer = styled.div.attrs({
  className: 'multiple-majority-container',
})<{
  disabled: boolean
  asPreview: boolean
  enableBars: boolean
  disableColors: boolean
}>`
  display: flex;
  flex-direction: row;

  &:hover {
    .majority-container {
      &:hover,
      &.majority-checked,
      &.majority-disabled {
        .label-container {
          opacity: 1;
        }
      }

      .label-container {
        opacity: ${props => (props.asPreview ? 1 : 0.7)};
      }
    }
  }

  ${({ enableBars, disableColors }) =>
    enableBars &&
    disableColors &&
    css`
      & > .majority-container {
        &::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 1px;
          transform-origin: left center;
          transform: scaleY(0.4);
          background-color: ${colors.white};
        }
        &:first-of-type::after {
          width: 0;
        }
        &:hover::after {
          width: 0;
        }
        &:hover + .majority-container::after {
          width: 0;
        }
      }
    `}

  .majority-container {
    &:first-of-type {
      border-left: ${props => props.disabled && 'none'};
      border-radius: ${MAIN_BORDER_RADIUS_SIZE} 0 0 ${MAIN_BORDER_RADIUS_SIZE};
    }

    &:last-of-type {
      border-radius: 0 ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE} 0;
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    flex-direction: column;
    text-align: center;

    .majority-container {
      &:first-of-type {
        border-left: ${props => props.disabled && 'none'};
        border-radius: ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE} 0 0;
      }

      &:last-of-type {
        border-radius: 0 0 ${MAIN_BORDER_RADIUS_SIZE} ${MAIN_BORDER_RADIUS_SIZE};
      }
    }
  }
`
