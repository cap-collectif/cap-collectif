// @flow
import * as React from 'react';
import type {
  Action,
  UserInviteModalState,
} from '~/components/Admin/UserInvite/Modal/UserInviteModal.reducer';
import { createReducer } from '~/components/Admin/UserInvite/Modal/UserInviteModal.reducer';

type ProviderProps = {|
  +children: React.Node | ((state: UserInviteModalState) => React.Node),
|};

export type Context = {|
  ...UserInviteModalState,
  +dispatch: Action => void,
|};

export const UserInviteModalContext = React.createContext<?Context>(undefined);

export const useUserInviteModalContext = (): Context => {
  const context = React.useContext(UserInviteModalContext);
  if (!context) {
    throw new Error(
      `You can't use the useUserInviteModalContext outside a UserInviteModalProvider component.`,
    );
  }
  return context;
};

export const UserInviteModalProvider = ({ children }: ProviderProps) => {
  const [state, dispatch] = React.useReducer<UserInviteModalState, Action>(createReducer, {
    step: 'CHOOSE_USERS',
    emails: [],
  });

  const context = React.useMemo<Context>(
    () => ({
      ...state,
      dispatch,
    }),
    [state],
  );

  return (
    <UserInviteModalContext.Provider value={context}>
      {typeof children === 'function' ? children(state) : children}
    </UserInviteModalContext.Provider>
  );
};
