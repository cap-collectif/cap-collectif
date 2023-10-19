import type { Exact, Action } from '~/types'
import config from '../../config'
export type State = {
  readonly currentLanguage: string
}
const initialState: State = {
  currentLanguage: config.canUseDOM ? new URLSearchParams(window.location.search).get('tl') || window.locale : 'fr_FR',
}
type ChangeLanguageSelectedAction = {
  type: 'language/CHANGE_LANGUAGE_SELECTED'
  currentLanguage: string
}
export type LanguageAction = ChangeLanguageSelectedAction
export const changeEventSelected = (currentLanguage: string): LanguageAction => ({
  type: 'language/CHANGE_LANGUAGE_SELECTED',
  currentLanguage,
})
export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state }

    case 'language/CHANGE_LANGUAGE_SELECTED':
      return { ...state, currentLanguage: action.currentLanguage }

    default:
      return state
  }
}
