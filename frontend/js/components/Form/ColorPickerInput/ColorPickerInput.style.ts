import styled, { css } from 'styled-components'
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables'
import colors from '~/utils/colors'

export const ColorPickerInputContainer = styled.div.attrs({
  className: 'color-picker-input-container',
})<{
  hasValue: boolean
}>`
  position: relative;

  .chrome-picker {
    position: absolute;
    z-index: 1;
  }

  ${props =>
    props.hasValue &&
    css`
      .form-control {
        padding-left: 30px;
      }
    `};
`
export const PreviewColor = styled.div<{
  color: string
}>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 10px;
  background-color: ${props => props.color};
  border: 1px solid ${colors.borderColor};
  ${MAIN_BORDER_RADIUS};
  width: 15px;
  height: 15px;
`
