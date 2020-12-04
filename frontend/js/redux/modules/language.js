// @flow
import type { Exact, Action } from '~/types';

export type State = {
  +currentLanguage: string,
};

const initialState: State = {
  currentLanguage: new URLSearchParams(window.location.search).get('tl') || window.locale,
};

type ChangeLanguageSelectedAction = {
  type: 'language/CHANGE_LANGUAGE_SELECTED',
  currentLanguage: string,
};

export type LanguageAction = ChangeLanguageSelectedAction;

export const changeEventSelected = (currentLanguage: string): LanguageAction => ({
  type: 'language/CHANGE_LANGUAGE_SELECTED',
  currentLanguage,
});

export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state };
    case 'language/CHANGE_LANGUAGE_SELECTED':
      return { ...state, currentLanguage: action.currentLanguage };
    default:
      return state;
  }
};
