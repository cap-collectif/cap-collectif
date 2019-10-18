// @flow

export function getInlineStyleSelected(editorState: Object): Array<string> {
  const styleList = editorState
    .getCurrentInlineStyle()
    .toList()
    .toJS();
  return styleList;
}

export function isBlockActive(editorState: Object, type: string): boolean {
  if (!editorState) return false;

  const startKey = editorState.getSelection().getStartKey();
  const selectedBlockType = editorState
    .getCurrentContent()
    .getBlockForKey(startKey)
    .getType();

  return selectedBlockType === type;
}

export function isEntityActive(editorState: Object, type: string): boolean {
  if (!editorState) return false;

  const styleList = editorState
    .getCurrentInlineStyle()
    .toList()
    .toJS();
  return styleList.includes(type);
}

export function getActiveColor(editorState: Object, type: string): ?string {
  if (!editorState) return null;

  const styles = editorState.getCurrentInlineStyle();
  const colorLabel = styles.filter(value => value.startsWith(`${type}-`)).first();
  const color = colorLabel ? colorLabel.replace(`${type}-`, '') : '';
  return color;
}
