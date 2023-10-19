// @ts-nocheck
import React from 'react'
import type { IntlShape } from 'react-intl'
import { injectIntl } from 'react-intl'
import * as Icons from '../components/Icons'
import FormatDropdown from './FormatDropdown'
import ColorsPanel from './ColorsPanel'
import AlignmentPanel from './AlignmentPanel'
import TitlesPanel from './TitlesPanel'
import ImagePanel from './ImagePanel'
import FormatButton from './FormatButton'
import ToggleViewSource from './ToggleViewSource'
import { Toolbar, ToolbarGroup } from './Toolbar.style'
import InlineStyleButton from './InlineStyleButton'
import BlockStyleButton from './BlockStyleButton'
import { isBlockActive, getActiveColor } from '../utils'
import type { DraftEditorState, DraftTextDirection } from '../models/types'
import '../models/types'

type Props = {
  editorState: DraftEditorState
  fullscreenMode: boolean
  intl: IntlShape
  // Actions to perform on buttons click
  insertHorizontalRuleClick: () => void
  insertIframeClick: () => void
  insertImageClick: () => void
  insertLinkClick: () => void
  insertSoftNewlineClick: () => void
  insertTableClick: () => void
  onAlignmentClick: (arg0: DraftTextDirection) => void
  onClearFormatClick: () => void
  onColorClick: (arg0: string) => void
  onFullscreenClick: () => void
  onHighlightClick: (arg0: string) => void
  onRedoClick: () => void
  onTitleClick: (arg0: string) => void
  onUndoClick: () => void
  toggleEditorMode: () => void
  uploadLocalImage?: (onSuccess: (arg0: string) => void, onError: string | Record<string, any>) => void
  attachFile?: (onSuccess: (arg0: string) => void, onError: string | Record<string, any>) => void
  insertLink: (data: any) => void
  // Features toogle
  enableIndent?: boolean
  enableViewSource?: boolean
}

function WysiwygToolbar({
  editorState,
  fullscreenMode,
  intl,
  insertHorizontalRuleClick,
  insertIframeClick,
  insertImageClick,
  insertLinkClick,
  insertSoftNewlineClick,
  insertTableClick,
  onAlignmentClick,
  onClearFormatClick,
  onColorClick,
  onFullscreenClick,
  onHighlightClick,
  onRedoClick,
  onTitleClick,
  onUndoClick,
  toggleEditorMode,
  uploadLocalImage,
  attachFile,
  insertLink,
  enableIndent = false,
  enableViewSource = true,
}: Props) {
  function uploadFile(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    async function onSuccess(url: string) {
      insertLink({
        href: url,
      })
    }

    function onError(err: string | Record<string, any>) {
      // TODO: handle error better
      console.error(err) // eslint-disable-line no-console
    }

    // @ts-expect-error: function is not called if uploadLocalImage is undefined
    attachFile(onSuccess, onError)
  }

  return (
    <Toolbar>
      <ToolbarGroup>
        <FormatButton
          onClick={onUndoClick}
          tabIndex="-1"
          title={intl.formatMessage({
            id: 'editor.undo',
          })}
          shortcut="⌘Z"
        >
          <Icons.Undo />
        </FormatButton>
        <FormatButton
          onClick={onRedoClick}
          tabIndex="-1"
          title={intl.formatMessage({
            id: 'editor.redo',
          })}
          shortcut="⌘Y"
        >
          <Icons.Redo />
        </FormatButton>
      </ToolbarGroup>
      <ToolbarGroup>
        <InlineStyleButton
          styleName="BOLD"
          title={intl.formatMessage({
            id: 'editor.bold',
          })}
          shortcut="⌘B"
        >
          <Icons.Bold />
        </InlineStyleButton>
        <InlineStyleButton
          styleName="ITALIC"
          title={intl.formatMessage({
            id: 'editor.italic',
          })}
          shortcut="⌘I"
        >
          <Icons.Italic />
        </InlineStyleButton>
        <InlineStyleButton
          styleName="UNDERLINE"
          title={intl.formatMessage({
            id: 'editor.underline',
          })}
          shortcut="⌘U"
        >
          <Icons.Underlined />
        </InlineStyleButton>
        <InlineStyleButton
          styleName="STRIKETHROUGH"
          title={intl.formatMessage({
            id: 'editor.strike',
          })}
          shortcut="⌘+Maj+X"
        >
          <Icons.Strikethrough />
        </InlineStyleButton>
      </ToolbarGroup>
      <ToolbarGroup>
        <FormatDropdown
          tabIndex="-1"
          title={intl.formatMessage({
            id: 'editor.color',
          })}
          panel={<ColorsPanel onColorClick={onColorClick} currentColor={getActiveColor(editorState, 'color')} />}
        >
          <Icons.ColorText currentColor={getActiveColor(editorState, 'color')} />
        </FormatDropdown>
        <FormatDropdown
          tabIndex="-1"
          title={intl.formatMessage({
            id: 'editor.highlight',
          })}
          panel={<ColorsPanel onColorClick={onHighlightClick} currentColor={getActiveColor(editorState, 'bg')} />}
        >
          <Icons.ColorFill currentColor={getActiveColor(editorState, 'bg')} />
        </FormatDropdown>
        <FormatButton
          onClick={onClearFormatClick}
          tabIndex="-1"
          title={intl.formatMessage({
            id: 'editor.clear.format',
          })}
          shortcut="⌘&bsol;"
        >
          <Icons.ClearFormat />
        </FormatButton>
      </ToolbarGroup>
      <ToolbarGroup>
        <FormatDropdown
          active={isBlockActive(editorState, 'text-align-left')}
          tabIndex="-1"
          title={intl.formatMessage({
            id: 'editor.align',
          })}
          panel={
            <AlignmentPanel
              editorState={editorState}
              onAlignmentClick={onAlignmentClick}
              isBlockActive={isBlockActive}
            />
          }
        >
          <Icons.AlignLeft />
        </FormatDropdown>
      </ToolbarGroup>
      <ToolbarGroup>
        <FormatDropdown
          active={isBlockActive(editorState, 'header-one')}
          tabIndex="-1"
          title={intl.formatMessage({
            id: 'editor.title',
          })}
          panel={<TitlesPanel editorState={editorState} onTitleClick={onTitleClick} isBlockActive={isBlockActive} />}
        >
          <Icons.Size />
        </FormatDropdown>
      </ToolbarGroup>
      <ToolbarGroup>
        <BlockStyleButton
          styleName="unordered-list-item"
          title={intl.formatMessage({
            id: 'editor.list.unordered',
          })}
          shortcut="⌘+Maj+7"
        >
          <Icons.ListBulleted />
        </BlockStyleButton>
        <BlockStyleButton
          styleName="ordered-list-item"
          title={intl.formatMessage({
            id: 'editor.list.ordered',
          })}
          shortcut="⌘+Maj+8"
        >
          <Icons.ListNumbered />
        </BlockStyleButton>
        {enableIndent && (
          <FormatButton
            title={intl.formatMessage({
              id: 'editor.indent.less',
            })}
            shortcut="⌘+]"
            disabled
          >
            <Icons.IndentDecrease />
          </FormatButton>
        )}
        {enableIndent && (
          <FormatButton
            title={intl.formatMessage({
              id: 'editor.indent.more',
            })}
            shortcut="⌘+["
            disabled
          >
            <Icons.IndentIncrease />
          </FormatButton>
        )}
      </ToolbarGroup>
      <ToolbarGroup>
        <FormatButton
          onClick={insertHorizontalRuleClick}
          tabIndex="-1"
          title={intl.formatMessage({
            id: 'editor.hr.insert',
          })}
        >
          <Icons.InsertHorizontalRule />
        </FormatButton>
        <FormatButton
          onClick={insertLinkClick}
          tabIndex="-1"
          title={intl.formatMessage({
            id: 'editor.link.insert',
          })}
          shortcut="⌘K"
          disabled={editorState.getSelection().isCollapsed()}
        >
          <Icons.InsertLink />
        </FormatButton>
        <BlockStyleButton
          styleName="blockquote"
          title={intl.formatMessage({
            id: 'editor.blockquote.insert',
          })}
        >
          <Icons.Quote />
        </BlockStyleButton>
        <FormatDropdown
          tabIndex="-1"
          title={intl.formatMessage({
            id: 'editor.image.insert',
          })}
          panel={<ImagePanel onInsertImage={insertImageClick} uploadLocalImage={uploadLocalImage} />}
        >
          <Icons.InsertPhoto />
        </FormatDropdown>
        <FormatButton
          onClick={insertIframeClick}
          tabIndex="-1"
          title={intl.formatMessage({
            id: 'editor.iframe.insert',
          })}
        >
          <Icons.InsertEmbed />
        </FormatButton>
        {uploadLocalImage && (
          <FormatButton
            onClick={uploadFile}
            tabIndex="-1"
            disabled={editorState.getSelection().isCollapsed()}
            title={intl.formatMessage({
              id: 'editor.file.attach',
            })}
          >
            <Icons.AttachFile />
          </FormatButton>
        )}
        <FormatButton
          disabled // for now
          onClick={insertTableClick}
          tabIndex="-1"
          title={intl.formatMessage({
            id: 'editor.table.insert',
          })}
        >
          <Icons.Table />
        </FormatButton>
      </ToolbarGroup>
      <ToolbarGroup>
        <FormatButton
          onClick={insertSoftNewlineClick}
          tabIndex="-1"
          title={intl.formatMessage({
            id: 'editor.br.insert',
          })}
          shortcut="⌘+Maj+Entrée"
        >
          <Icons.InsertNewLine />
        </FormatButton>
        {enableViewSource && <ToggleViewSource toggleEditorMode={toggleEditorMode} />}
        <FormatButton tabIndex="-1" onClick={onFullscreenClick}>
          {fullscreenMode ? <Icons.FullscreenExit /> : <Icons.Fullscreen />}
        </FormatButton>
      </ToolbarGroup>
    </Toolbar>
  )
}

export default injectIntl(WysiwygToolbar)
