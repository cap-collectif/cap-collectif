// @flow
import React from 'react';

import * as Icons from '../components/Icons';
import FormatDropdown from './FormatDropdown';
import ColorsPanel from './ColorsPanel';
import AlignmentPanel from './AlignmentPanel';
import TitlesPanel from './TitlesPanel';
import PhotoPanel from './PhotoPanel';
import FormatButton from './FormatButton';
import ToggleViewSource from './ToggleViewSource';
import { Toolbar, ToolbarGroup } from './Toolbar.style';

import InlineStyleButton from './InlineStyleButton';
import BlockStyleButton from './BlockStyleButton';

import { isBlockActive, getActiveColor } from '../utils';

type Props = {
  editorState: Object,
  handleChange: Function,
  fullscreenMode: boolean,
  onAlignmentClick: Function,
  onColorClick: Function,
  onHighlightClick: Function,
  onTitleClick: Function,
  onInsertLinkClick: Function,
  onInsertImage: Function,
  onInsertEmbed: Function,
  onUndoClick: Function,
  onRedoClick: Function,
  onFullscreenClick: Function,
  onClearFormatClick: Function,
  onInsertSoftNewlineClick: Function,
  onInsertHorizontalRuleClick: Function,
  toggleEditorMode: Function,
  uploadLocalImage?: Function,
  // Features toogle
  enableIndent?: boolean,
};

function WysiwygToolbar({
  editorState,
  handleChange,
  fullscreenMode,
  onAlignmentClick,
  onColorClick,
  onHighlightClick,
  onTitleClick,
  onInsertLinkClick,
  onInsertImage,
  onInsertEmbed,
  onUndoClick,
  onRedoClick,
  onFullscreenClick,
  onClearFormatClick,
  onInsertSoftNewlineClick,
  onInsertHorizontalRuleClick,
  toggleEditorMode,
  uploadLocalImage,
  enableIndent = false,
}: Props) {
  return (
    <Toolbar>
      <ToolbarGroup>
        <FormatButton onClick={onUndoClick} tabIndex="-1" aria-label="Annuler" title="Annuler (⌘Z)">
          <Icons.Undo />
        </FormatButton>
        <FormatButton
          onClick={onRedoClick}
          tabIndex="-1"
          aria-label="Rétablir"
          title="Rétablir (⌘Y)">
          <Icons.Redo />
        </FormatButton>
      </ToolbarGroup>
      <ToolbarGroup>
        <InlineStyleButton
          styleName="BOLD"
          title="Gras"
          shortcut="⌘B"
          editorState={editorState}
          handleChange={handleChange}>
          <Icons.Bold />
        </InlineStyleButton>
        <InlineStyleButton
          styleName="ITALIC"
          title="Italique"
          shortcut="⌘I"
          editorState={editorState}
          handleChange={handleChange}>
          <Icons.Italic />
        </InlineStyleButton>
        <InlineStyleButton
          styleName="UNDERLINE"
          title="Souligné"
          shortcut="⌘U"
          editorState={editorState}
          handleChange={handleChange}>
          <Icons.Underlined />
        </InlineStyleButton>
        <InlineStyleButton
          styleName="STRIKETHROUGH"
          title="Barré"
          shortcut="⌘+Maj+X"
          editorState={editorState}
          handleChange={handleChange}>
          <Icons.Strikethrough />
        </InlineStyleButton>
      </ToolbarGroup>
      <ToolbarGroup>
        <FormatDropdown
          tabIndex="-1"
          aria-label="Couleur du texte"
          title="Couleur du texte"
          panel={
            <ColorsPanel
              onColorClick={onColorClick}
              currentColor={getActiveColor(editorState, 'color')}
            />
          }>
          <Icons.ColorText currentColor={getActiveColor(editorState, 'color')} />
        </FormatDropdown>
        <FormatDropdown
          tabIndex="-1"
          aria-label="Couleur de surlignage"
          title="Couleur de surlignage"
          panel={
            <ColorsPanel
              onColorClick={onHighlightClick}
              currentColor={getActiveColor(editorState, 'bg')}
            />
          }>
          <Icons.ColorFill currentColor={getActiveColor(editorState, 'bg')} />
        </FormatDropdown>
        <FormatButton
          onClick={onClearFormatClick}
          tabIndex="-1"
          aria-label="Supprimer la mise en forme"
          title="Supprimer la mise en forme (⌘\)">
          <Icons.ClearFormat />
        </FormatButton>
      </ToolbarGroup>
      <ToolbarGroup>
        <FormatDropdown
          active={isBlockActive(editorState, 'text-align-left')}
          tabIndex="-1"
          aria-label="Alignement"
          title="Alignement"
          panel={
            <AlignmentPanel
              editorState={editorState}
              onAlignmentClick={onAlignmentClick}
              isBlockActive={isBlockActive}
            />
          }>
          <Icons.AlignLeft />
        </FormatDropdown>
      </ToolbarGroup>
      <ToolbarGroup>
        <FormatDropdown
          active={isBlockActive(editorState, 'header-one')}
          tabIndex="-1"
          aria-label="Insérer un titre"
          title="Insérer un titre"
          panel={
            <TitlesPanel
              editorState={editorState}
              onTitleClick={onTitleClick}
              isBlockActive={isBlockActive}
            />
          }>
          <Icons.Size />
        </FormatDropdown>
      </ToolbarGroup>
      <ToolbarGroup>
        <BlockStyleButton
          styleName="unordered-list-item"
          title="Liste à puces"
          shortcut="⌘+Maj+7"
          editorState={editorState}
          handleChange={handleChange}>
          <Icons.ListBulleted />
        </BlockStyleButton>
        <BlockStyleButton
          styleName="ordered-list-item"
          title="Liste numérotée"
          shortcut="⌘+Maj+8"
          editorState={editorState}
          handleChange={handleChange}>
          <Icons.ListNumbered />
        </BlockStyleButton>
        {enableIndent && (
          <FormatButton aria-label="Diminuer le retrait" title="Diminuer le retrait (⌘+])" disabled>
            <Icons.IndentDecrease />
          </FormatButton>
        )}
        {enableIndent && (
          <FormatButton
            aria-label="Augmenter le retrait"
            title="Augmenter le retrait (⌘+[)"
            disabled>
            <Icons.IndentIncrease />
          </FormatButton>
        )}
      </ToolbarGroup>
      <ToolbarGroup>
        <FormatButton
          onClick={onInsertHorizontalRuleClick}
          tabIndex="-1"
          aria-label="Insérer un séparateur"
          title="Insérer un séparateur">
          <Icons.InsertHorizontalRule />
        </FormatButton>
        <FormatButton
          onClick={onInsertLinkClick}
          tabIndex="-1"
          aria-label="Insérer un lien"
          title="Insérer un lien (⌘K)">
          <Icons.InsertLink />
        </FormatButton>
        {/* <FormatButton
          tabIndex="-1"
          aria-label="Supprimer un lien"
          title="Supprimer un lien"
          disabled>
          <Icons.RemoveLink />
        </FormatButton> */}
        <BlockStyleButton
          styleName="blockquote"
          title="Insérer une citation"
          editorState={editorState}
          handleChange={handleChange}>
          <Icons.Quote />
        </BlockStyleButton>
        <FormatDropdown
          tabIndex="-1"
          aria-label="Insérer une photo"
          title="Insérer une photo"
          panel={<PhotoPanel onInsertImage={onInsertImage} uploadLocalImage={uploadLocalImage} />}>
          <Icons.InsertPhoto />
        </FormatDropdown>
        <FormatButton
          onClick={onInsertEmbed}
          tabIndex="-1"
          aria-label="Insérer une iframe"
          title="Insérer une iframe">
          <Icons.InsertEmbed />
        </FormatButton>
      </ToolbarGroup>
      <ToolbarGroup>
        <FormatButton
          onClick={onInsertSoftNewlineClick}
          tabIndex="-1"
          aria-label="Insérer un saut de ligne"
          title="Insérer un saut de ligne (⌘+Maj+Entrée)">
          <Icons.InsertNewLine />
        </FormatButton>
        <ToggleViewSource toggleEditorMode={toggleEditorMode} />
        <FormatButton tabIndex="-1" onClick={onFullscreenClick}>
          {fullscreenMode ? <Icons.FullscreenExit /> : <Icons.Fullscreen />}
        </FormatButton>
      </ToolbarGroup>
    </Toolbar>
  );
}

export default WysiwygToolbar;
