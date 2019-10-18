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

export type DraftColor =
  | 'white'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'grey'
  | 'black';

export type DraftEntityType = 'LINK' | 'IMAGE' | 'IFRAME' | 'HR';

export type DraftInlineStyle = 'BOLD' | 'ITALIC' | 'UNDERLINE' | 'STRIKETHROUGH' | 'CODE';

export type DraftBlockStyle = DraftListTypes | 'blockquote' | 'code-block' | DraftTitles;

export type DraftRemovalDirection = 'backward' | 'forward';

export type DraftEntityMutability = 'MUTABLE' | 'IMMUTABLE' | 'SEGMENTED';
