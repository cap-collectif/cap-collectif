// @flow
import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { change } from 'redux-form';
import Jodit from './JoditEditor';
import LegacyEditor from '../Editor';
import LegacyEditorDs from '../EditorDs';
import type { GlobalState } from '~/types';

// TODO: during the switch we can not add correct props, types
// Once the old editor is removed, please fix this.
type Props = Object;

const EditorSwitcher = ({
  initialContent,
  fieldUsingJoditWysiwyg,
  fieldUsingJoditWysiwygName,
  formName,
  ...props
}: Props) => {
  const dispatch = useDispatch();

  const currentLanguage = useSelector((state: GlobalState) => state.language.currentLanguage);

  const switchToNewEditor = () => dispatch(change(formName, fieldUsingJoditWysiwygName, true));

  return fieldUsingJoditWysiwyg ? (
    <Jodit {...props} value={initialContent} currentLanguage={currentLanguage} />
  ) : props.unstable__enableCapcoUiDs ? (
    <LegacyEditorDs {...props} value={initialContent} switchToNewEditor={switchToNewEditor} />
  ) : (
    <LegacyEditor
      {...props}
      value={initialContent}
      initialContent={initialContent}
      switchToNewEditor={switchToNewEditor}
    />
  );
};

export default EditorSwitcher;
