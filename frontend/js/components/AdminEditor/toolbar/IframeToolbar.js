// @flow
import React, { useEffect, useContext, type Node, type ComponentType } from 'react';
import styled, { css } from 'styled-components';
import { injectIntl, type IntlShape } from 'react-intl';

import { DispatchContext } from '../context';
import * as Icons from '../components/Icons';
import { useDialogState } from '../components/Dialog';
import { Popover, usePopoverState } from '../components/Popover';
import { type DraftContentBlock, type IframeEntityData } from '../models/types';

import FormatButton from './FormatButton';
import IframePropertiesDialog from './IframePropertiesDialog';
import { ToolbarGroup } from './Toolbar.style';

type MediaWrapperProps = {};

const MediaWrapper: ComponentType<MediaWrapperProps> = styled('div')`
  position: relative;
`;

const focusStyle = css`
  border-radius: 3px;
  box-shadow: 0 0 0 4px hsla(206, 79%, 53%, 0.4);
`;

type MediaBackdropProps = {
  focused: boolean,
};

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
`;

type IframeToolbarProps = {
  children: Node,
  intl: IntlShape,
  block: DraftContentBlock,
  entityData?: IframeEntityData,
};

function IframeToolbar({ block, entityData, children, intl }: IframeToolbarProps) {
  const dispatchAction = useContext(DispatchContext);
  const iframePopover = usePopoverState({ placement: 'top' });
  const editIframeDialog = useDialogState();

  function handleClick(event: SyntheticMouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    iframePopover.show();
  }

  function handleAlignmentClick(event: SyntheticMouseEvent<HTMLButtonElement>, alignment) {
    event.preventDefault();
    dispatchAction({ type: 'editBlockData', data: { alignment }, block });
  }

  function handleEditButtonClick(event: SyntheticMouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    iframePopover.hide();
    editIframeDialog.show();
  }

  function handleEdit(data) {
    dispatchAction({ type: 'editBlockEntityData', data, block });
  }

  // Manage focus of Draft Editor
  // SEE: https://draftjs.org/docs/advanced-topics-block-components.html#recommendations-and-other-notes
  useEffect(() => {
    if (editIframeDialog.visible) {
      dispatchAction({ type: 'blur' });
    } else {
      dispatchAction({ type: 'focus' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editIframeDialog.visible]);

  return (
    <>
      <IframePropertiesDialog
        mode="edit"
        onConfirm={handleEdit}
        initialData={entityData}
        {...editIframeDialog}
      />
      <MediaWrapper>
        <Popover {...iframePopover}>
          <ToolbarGroup>
            <FormatButton
              onClick={event => handleAlignmentClick(event, 'left')}
              tabIndex="-1"
              title={intl.formatMessage({ id: 'editor.align.left' })}>
              <Icons.AlignLeft />
            </FormatButton>
            <FormatButton
              onClick={event => handleAlignmentClick(event, 'center')}
              tabIndex="-1"
              title={intl.formatMessage({ id: 'editor.align.center' })}>
              <Icons.AlignCenter />
            </FormatButton>
            <FormatButton
              onClick={event => handleAlignmentClick(event, 'right')}
              tabIndex="-1"
              title={intl.formatMessage({ id: 'editor.align.right' })}>
              <Icons.AlignRight />
            </FormatButton>
          </ToolbarGroup>
          <ToolbarGroup>
            <FormatButton
              onClick={handleEditButtonClick}
              tabIndex="-1"
              title={intl.formatMessage({ id: 'editor.iframe.edit' })}>
              <Icons.Edit />
            </FormatButton>
            {/* <FormatButton
              onClick={() => {}}
              tabIndex="-1"
              title={intl.formatMessage({ id: 'editor.iframe.delete' })}>
              <Icons.Delete />
            </FormatButton> */}
          </ToolbarGroup>
        </Popover>
        {children}
        <MediaBackdrop onClick={handleClick} focused={iframePopover.visible} />
      </MediaWrapper>
    </>
  );
}

export default injectIntl(IframeToolbar);
