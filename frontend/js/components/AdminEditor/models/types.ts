export type DraftListTypes = 'unordered-list-item' | 'ordered-list-item'
export type DraftTextDirection = 'left' | 'right' | 'center' | 'justify'
export type DraftTitles = 'header-one' | 'header-two' | 'header-three' | 'header-four' | 'header-five' | 'header-six'
export type DraftEntityType = 'LINK' | 'IMAGE' | 'IFRAME' | 'HR'
export type DraftInlineStyle = 'BOLD' | 'ITALIC' | 'UNDERLINE' | 'STRIKETHROUGH' | 'CODE'
export type DraftBlockStyle = DraftListTypes | 'blockquote' | 'code-block' | DraftTitles
export type DraftRemovalDirection = 'backward' | 'forward'
export type DraftEntityMutability = 'MUTABLE' | 'IMMUTABLE' | 'SEGMENTED'
export type DraftEditorState = Record<string, any>
export type DraftContentState = Record<string, any>
export type DraftContentBlock = Record<string, any>
export type DraftEntity = Record<string, any>
export type LinkEntityData = {
  href: string
  targetBlank?: boolean
}
export type ImageEntityData = LinkEntityData & {
  src: string
  alt?: string | null | undefined
  width?: (number | null | undefined) | (string | null | undefined)
  height?: (number | null | undefined) | (string | null | undefined)
  border?: (number | null | undefined) | (string | null | undefined)
  marginX?: (number | null | undefined) | (string | null | undefined)
  marginY?: (number | null | undefined) | (string | null | undefined)
  alignment?: DraftTextDirection
}
export type IframeEntityData = {
  src: string
  title?: string | null | undefined
  width?: (number | null | undefined) | (string | null | undefined)
  height?: (number | null | undefined) | (string | null | undefined)
  marginX?: (number | null | undefined) | (string | null | undefined)
  marginY?: (number | null | undefined) | (string | null | undefined)
}
export type TableEntityData = {
  lines: (number | null | undefined) | (string | null | undefined)
  columns: (number | null | undefined) | (string | null | undefined)
  alignment?: string
}
