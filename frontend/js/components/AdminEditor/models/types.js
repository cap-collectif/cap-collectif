// @flow
export type DraftListTypes = 'unordered-list-item' | 'ordered-list-item';

export type DraftTextDirection = 'left' | 'right' | 'center' | 'justify';

export type DraftTitles =
  | 'header-one'
  | 'header-two'
  | 'header-three'
  | 'header-four'
  | 'header-five'
  | 'header-six';

export type DraftEntityType = 'LINK' | 'IMAGE' | 'IFRAME' | 'HR';

export type DraftInlineStyle = 'BOLD' | 'ITALIC' | 'UNDERLINE' | 'STRIKETHROUGH' | 'CODE';

export type DraftBlockStyle = DraftListTypes | 'blockquote' | 'code-block' | DraftTitles;

export type DraftRemovalDirection = 'backward' | 'forward';

export type DraftEntityMutability = 'MUTABLE' | 'IMMUTABLE' | 'SEGMENTED';

export type DraftEditorState = Object;

export type DraftContentState = Object;

export type DraftContentBlock = Object;

export type DraftEntity = Object;

export type LinkEntityData = {
  href: string,
  targetBlank?: boolean,
};

export type ImageEntityData = {
  ...LinkEntityData,
  src: string,
  alt?: ?string,
  width?: ?number | ?string,
  height?: ?number | ?string,
  border?: ?number | ?string,
  marginX?: ?number | ?string,
  marginY?: ?number | ?string,
  alignment?: DraftTextDirection,
};

export type IframeEntityData = {
  src: string,
  title?: ?string,
  width?: ?number | ?string,
  height?: ?number | ?string,
  marginX?: ?number | ?string,
  marginY?: ?number | ?string,
};

export type TableEntityData = {
  lines: ?number | ?string,
  columns: ?number | ?string,
  alignment?: string,
};
