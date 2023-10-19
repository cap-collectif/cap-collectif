// @ts-nocheck
import type { Node, ComponentType } from 'react'
import React, { useEffect, useContext } from 'react'
import styled, { css } from 'styled-components'
import type { IntlShape } from 'react-intl'
import { injectIntl } from 'react-intl'
import { DispatchContext } from '../context'
import * as Icons from '../components/Icons'
import { useDialogState } from '../components/Dialog'
import { Popover, usePopoverState } from '../components/Popover'
import type { DraftContentBlock, ImageEntityData } from '../models/types'
import '../models/types'
import FormatButton from './FormatButton'
import ImagePropertiesDialog from './ImagePropertiesDialog'
import { ToolbarGroup } from './Toolbar.style'

type MediaWrapperProps = {}
const MediaWrapper: ComponentType<MediaWrapperProps> = styled('div')`
  position: relative;
`
const focusStyle = css`
  border-radius: 3px;
  box-shadow: 0 0 0 4px hsla(206, 79%, 53%, 0.4);
`
type MediaBackdropProps = {
  focused: boolean
}
const MediaBackdrop: ComponentType<MediaBackdropProps> = styled('div')`
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  ${({ focused }) => focused && focusStyle}

  &:hover {
    ${focusStyle}
  }
`
type ImageToolbarProps = {
  children: Node
  intl: IntlShape
  block: DraftContentBlock
  entityData?: ImageEntityData
}

function ImageToolbar({ block, entityData, children, intl }: ImageToolbarProps) {
  const dispatchAction = useContext(DispatchContext)
  const imagePopover = usePopoverState({
    placement: 'top',
  })
  const editImageDialog = useDialogState()

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    imagePopover.show()
  }

  function handleAlignmentClick(event: React.MouseEvent<HTMLButtonElement>, alignment) {
    event.preventDefault()
    dispatchAction({
      type: 'editBlockData',
      data: {
        alignment,
      },
      block,
    })
  }

  function handleEditButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    imagePopover.hide()
    editImageDialog.show()
  }

  function handleEdit(data): void {
    dispatchAction({
      type: 'editBlockEntityData',
      data,
      block,
    })
  }

  // Manage focus of Draft Editor
  // SEE: https://draftjs.org/docs/advanced-topics-block-components.html#recommendations-and-other-notes
  useEffect(() => {
    if (editImageDialog.visible) {
      dispatchAction({
        type: 'blur',
      })
    } else {
      dispatchAction({
        type: 'focus',
      })
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editImageDialog.visible])
  return (
    <>
      <ImagePropertiesDialog mode="edit" onConfirm={handleEdit} initialData={entityData} {...editImageDialog} />
      <MediaWrapper>
        <Popover {...imagePopover}>
          <ToolbarGroup>
            <FormatButton
              onClick={event => handleAlignmentClick(event, 'left')}
              tabIndex="-1"
              title={intl.formatMessage({
                id: 'editor.align.left',
              })}
            >
              <Icons.AlignLeft />
            </FormatButton>
            <FormatButton
              onClick={event => handleAlignmentClick(event, 'center')}
              tabIndex="-1"
              title={intl.formatMessage({
                id: 'editor.align.center',
              })}
            >
              <Icons.AlignCenter />
            </FormatButton>
            <FormatButton
              onClick={event => handleAlignmentClick(event, 'right')}
              tabIndex="-1"
              title={intl.formatMessage({
                id: 'editor.align.right',
              })}
            >
              <Icons.AlignRight />
            </FormatButton>
          </ToolbarGroup>
          <ToolbarGroup>
            <FormatButton
              onClick={handleEditButtonClick}
              tabIndex="-1"
              title={intl.formatMessage({
                id: 'editor.image.edit',
              })}
            >
              <Icons.Edit />
            </FormatButton>
            {/* <FormatButton
             onClick={() => {}}
             tabIndex="-1"
             title={intl.formatMessage({ id: 'editor.image.delete' })}>
             <Icons.Delete />
            </FormatButton> */}
          </ToolbarGroup>
        </Popover>
        {children}
        <MediaBackdrop onClick={handleClick} focused={imagePopover.visible} />
      </MediaWrapper>
    </>
  )
}

export default injectIntl(ImageToolbar)
