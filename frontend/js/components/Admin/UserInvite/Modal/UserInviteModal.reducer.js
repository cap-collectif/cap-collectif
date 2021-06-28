// @flow

import type { InviteUsersRole } from '~relay/InviteUserMutation.graphql';

type UserInviteModalStep = 'CHOOSE_USERS' | 'CHOOSE_ROLE' | 'SENDING_CONFIRMATION';

type Groups = Array<{|
  +id: string,
  +label: string,
|}>;

export type UserInviteModalState = {|
  +step: UserInviteModalStep,
  +emails: string[],
  +groups: Groups,
  +role: InviteUsersRole,
|};

export type Action =
  | { type: 'GOTO_ROLE_STEP', payload: string[] }
  | { type: 'GOTO_CHOOSE_USERS_STEP' }
  | {
      type: 'GOTO_SENDING_CONFIRMATION',
      payload: { emails: string[], role: InviteUsersRole, groups: Groups },
    };

export const initialState: UserInviteModalState = {
  step: 'CHOOSE_USERS',
  emails: [],
  groups: [],
  role: 'ROLE_USER',
};

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
        role: action.payload.role,
        groups: action.payload.groups,
        step: 'SENDING_CONFIRMATION',
      };
    default:
      throw new Error(`Unknown action : ${action.type}`);
  }
};
