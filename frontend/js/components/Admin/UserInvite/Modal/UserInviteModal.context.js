// @flow
import * as React from 'react';
import type {
  Action,
  UserInviteModalState,
} from '~/components/Admin/UserInvite/Modal/UserInviteModal.reducer';
import { createReducer, initialState } from '~/components/Admin/UserInvite/Modal/UserInviteModal.reducer';

type ProviderProps = {|
  +children: React.Node | ((state: UserInviteModalState) => React.Node),
|};

export type Context = {|
  ...UserInviteModalState,
  +dispatch: Action => void,
|};

export const UserInviteModalContext: React.Context<?Context> = React.createContext<?Context>(undefined);

export const useUserInviteModalContext = (): Context => {
  const context = React.useContext(UserInviteModalContext);
  if (!context) {
    throw new Error(
      `You can't use the useUserInviteModalContext outside a UserInviteModalProvider component.`,
    );
  }
  return context;
};

export const UserInviteModalProvider = ({ children }: ProviderProps): React.Node => {
  const [state, dispatch] = React.useReducer<UserInviteModalState, Action>(createReducer, initialState);

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
