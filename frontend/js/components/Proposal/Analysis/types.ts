export type User = {
  id: string
  displayName: string
}
export type PanelState =
  | 'HOME'
  | 'EDIT_ANALYSIS'
  | 'VIEW_ANALYSIS'
  | 'EDIT_ASSESSMENT'
  | 'VIEW_ASSESSMENT'
  | 'EDIT_DECISION'
  | 'VIEW_DECISION'
