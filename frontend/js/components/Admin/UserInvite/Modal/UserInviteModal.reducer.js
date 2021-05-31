// @flow

type UserInviteModalStep = 'CHOOSE_USERS' | 'CHOOSE_ROLE' | 'SENDING_CONFIRMATION';

type Groups = Array<{|
  +id: string,
  +label: string
|}>

export type UserInviteModalState = {|
  +step: UserInviteModalStep,
  +emails: string[],
  +groups: Groups,
  +isAdmin: boolean
|};

export type Action =
  | { type: 'GOTO_ROLE_STEP', payload: string[] }
  | { type: 'GOTO_CHOOSE_USERS_STEP' }
  | { type: 'GOTO_SENDING_CONFIRMATION', payload: { emails: string[], isAdmin: boolean, groups: Groups } }

export const initialState: UserInviteModalState = {
  step: 'CHOOSE_USERS',
  emails: [],
  isAdmin: false,
  groups: []
}

export const createReducer = (
  state: UserInviteModalState,
  action: Action,
): UserInviteModalState => {
  switch (action.type) {
    case 'GOTO_CHOOSE_USERS_STEP':
      return {
        ...initialState,
        step: 'CHOOSE_USERS',
      };
    case 'GOTO_ROLE_STEP':
      return {
        ...initialState,
        emails: action.payload,
        step: 'CHOOSE_ROLE',
      };
    case 'GOTO_SENDING_CONFIRMATION':
      return {
        emails: action.payload.emails,
        isAdmin: action.payload.isAdmin,
        groups: action.payload.groups,
        step: 'SENDING_CONFIRMATION',
      };
    default:
      throw new Error(`Unknown action : ${action.type}`);
  }
};
