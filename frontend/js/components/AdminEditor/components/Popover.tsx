// @ts-nocheck
import { $Shape } from 'utility-types'
import type { Node, ComponentType } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'
import type { DialogState } from './Dialog'
import { useDialogState } from './Dialog'

type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right'
export type PopoverState = DialogState & {
  gutter?: number
  placement?: PopoverPlacement
}
type PopoverWrapperProps = {
  visible: boolean
}
const PopoverWrapper: ComponentType<PopoverWrapperProps> = styled('div')`
  position: absolute;
  left: 50%;
  top: -10px;
  display: flex;
  flex-direction: row;
  padding: 5px 10px;
  box-shadow: 1px 3px 4px rgba(0, 0, 0, 0.3);
  background-color: rgba(255, 255, 255, 1);
  transition: opacity 0.15s ease-in-out;
  transform: translate(-50%, -100%);
  z-index: -1;
  pointer-events: none;
  ${({ visible }) =>
    visible &&
    css`
      display: flex;
      z-index: 9999;
      pointer-events: auto;
    `}
`
const defaultPopoverState = {
  gutter: 10,
  placement: 'top',
}
export function usePopoverState(initialState: $Shape<PopoverState> = defaultPopoverState): PopoverState {
  const [popoverState] = useState<$Shape<PopoverState>>(initialState)
  const dialog = useDialogState()
  return { ...dialog, ...popoverState }
}
type PopoverProps = PopoverState & {
  children?: Node
}
export function Popover({ children, ...rest }: PopoverProps) {
  const { visible, hide } = rest
  const node = useRef()
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Detect if click is inside container (do nothing)
      // @ts-expect-error node is a ref that contains a DOM element
      if (node?.current?.contains(event.target)) {
        return
      }

      hide()
    }

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [visible, hide])
  return (
    // @ts-expect-error To rework when WYSIWYG development restarts
    <PopoverWrapper ref={node} {...rest}>
      {visible && children}
    </PopoverWrapper>
  )
}
export default Popover
