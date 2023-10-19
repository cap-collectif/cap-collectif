// @ts-nocheck
import type { Node, ComponentType } from 'react'
import React, { useEffect, useContext } from 'react'
import styled from 'styled-components'
import type { IntlShape } from 'react-intl'
import { injectIntl } from 'react-intl'
import { DispatchContext, EntityContext } from '../context'
import * as Icons from '../components/Icons'
import { useDialogState } from '../components/Dialog'
import { Popover, usePopoverState } from '../components/Popover'
import type { LinkEntityData } from '../models/types'
import '../models/types'
import FormatButton from './FormatButton'
import LinkPropertiesDialog from './LinkPropertiesDialog'
import { ToolbarGroup } from './Toolbar.style'

type MediaWrapperProps = {}
const MediaWrapper: ComponentType<MediaWrapperProps> = styled('span')`
  position: relative;
`
type LinkToolbarProps = {
  children: Node
  intl: IntlShape
  entityKey: string
  entityData?: LinkEntityData
}

function LinkToolbar({ entityKey, entityData, children, intl }: LinkToolbarProps) {
  const currentSelectedEntity = useContext(EntityContext)
  const dispatchAction = useContext(DispatchContext)
  const linkPopover = usePopoverState({
    placement: 'top',
  })
  const editLinkDialog = useDialogState()

  function handleVisitButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    // @ts-expect-error: href is defined here
    window.open(entityData.href)
  }

  function handleEditButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    linkPopover.hide()
    editLinkDialog.show()
  }

  function handleRemoveButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    linkPopover.hide()
    dispatchAction({
      type: 'removeLink',
    })
  }

  function handleEdit(data) {
    linkPopover.hide()
    dispatchAction({
      type: 'editLink',
      data,
      entityKey,
    })
  }

  // Manage focus of Draft Editor
  // SEE: https://draftjs.org/docs/advanced-topics-block-components.html#recommendations-and-other-notes
  useEffect(() => {
    if (editLinkDialog.visible) {
      dispatchAction({
        type: 'blur',
      })
    } else {
      dispatchAction({
        type: 'focus',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editLinkDialog.visible])
  // Manage popover opening when focusing the link
  useEffect(() => {
    // Check the current selection to know if it's the right entity
    if (!editLinkDialog.visible && !linkPopover.visible && entityKey === currentSelectedEntity) {
      linkPopover.show()
    } else if (linkPopover.visible && entityKey !== currentSelectedEntity) {
      linkPopover.hide()
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkPopover.visible, currentSelectedEntity])
  return (
    <>
      <LinkPropertiesDialog mode="edit" onConfirm={handleEdit} initialData={entityData} {...editLinkDialog} />
      <MediaWrapper>
        <Popover {...linkPopover}>
          <ToolbarGroup>
            <FormatButton
              onClick={handleVisitButtonClick}
              title={intl.formatMessage({
                id: 'editor.link.visit',
              })}
            >
              <Icons.OpenInNewWindow />
            </FormatButton>
          </ToolbarGroup>
          <ToolbarGroup>
            <FormatButton
              onClick={handleEditButtonClick}
              tabIndex="-1"
              title={intl.formatMessage({
                id: 'editor.link.edit',
              })}
            >
              <Icons.Edit />
            </FormatButton>
            <FormatButton
              onClick={handleRemoveButtonClick}
              tabIndex="-1"
              title={intl.formatMessage({
                id: 'editor.link.delete',
              })}
            >
              <Icons.RemoveLink />
            </FormatButton>
          </ToolbarGroup>
        </Popover>
        {children}
      </MediaWrapper>
    </>
  )
}

export default injectIntl(LinkToolbar)
