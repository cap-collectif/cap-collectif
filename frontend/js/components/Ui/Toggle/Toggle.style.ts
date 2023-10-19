import type { StyledComponent } from 'styled-components'
import styled, { css } from 'styled-components'
import { Popover } from 'react-bootstrap'
import colors from '~/utils/colors'

export type LabelSide = 'LEFT' | 'RIGHT'
export const LabelContainer = styled.label<{
  labelSide: LabelSide
  bold?: boolean
}>`
  display: flex;
  flex-direction: row;
  align-items: center;

  .label-toggler {
    order: ${props => (props.labelSide === 'LEFT' ? 0 : 1)};
    margin: ${props => (props.labelSide === 'LEFT' ? '0 10px 0 0' : '0 0 0 10px')};
    font-weight: ${props => (props.bold ? 'bold' : 'normal')};
  }
`
export const ToggleContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div.attrs({
  className: 'toggle-container',
})`
  & > div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }
  }
`
export const TogglerWrapper = styled.div<{
  disabled: boolean
  checked: boolean | null | undefined
}>`
  position: relative;
  display: inline-block;
  width: 35px;
  height: 20px;
  order: 1;
  flex-shrink: 0;

  .circle-toggler {
    position: absolute;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 20px;
    opacity: ${({ disabled }) => disabled && '.5'};
  }

  .circle-toggler:before {
    position: absolute;
    content: '';
    height: 10px;
    width: 10px;
    left: 5px;
    bottom: 5px;
    background-color: #fff;
    transition: 0.4s;
    border-radius: 50%;
  }

  ${props =>
    props.checked &&
    css`
      .circle-toggler {
        background-color: ${colors.blue};

        &:before {
          transform: translateX(16px);
        }
      }
    `};
`
export const PopoverContainer = styled(Popover)<{
  width?: string
}>`
  max-width: ${props => props.width || '275px'};
`
export const TooltipContent: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 10px 0;
`
export const CloseButton: StyledComponent<any, {}, HTMLButtonElement> = styled.button`
  border: none;
  background: none;
  padding: 0;
  margin-left: 12px;
`
export const TooltipFooter: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 9px;
  border-top: 1px solid ${colors.lightGray};

  .btn-cancel {
    border: 1px solid ${colors.darkGray};
    color: ${colors.darkGray};
  }

  .btn-confirm {
    background-color: ${colors.dangerColor};
    border: 1px solid ${colors.dangerColor};
    color: #fff;
    margin-left: 8px;
  }
`
