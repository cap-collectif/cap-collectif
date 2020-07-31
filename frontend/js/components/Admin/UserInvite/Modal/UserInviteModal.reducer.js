// @flow

type UserInviteModalStep = 'CHOOSE_USERS' | 'CHOOSE_ROLE';

export type UserInviteModalState = {|
  +step: UserInviteModalStep,
  +emails: string[],
|};

export type Action =
  | { type: 'GOTO_ROLE_STEP', payload: string[] }
  | { type: 'GOTO_CHOOSE_USERS_STEP' };

export const createReducer = (
  state: UserInviteModalState,
  action: Action,
): UserInviteModalState => {
  switch (action.type) {
    case 'GOTO_CHOOSE_USERS_STEP':
      return {
        emails: [],
        step: 'CHOOSE_USERS',
      };
    case 'GOTO_ROLE_STEP':
      return {
        emails: action.payload,
        step: 'CHOOSE_ROLE',
      };
    default:
      throw new Error(`Unknown action : ${action.type}`);
  }
};
