// @flow
import * as React from 'react';

export type Context = {|
  +reakitMenu: any,
  +hideOnClickOutside: boolean,
  +closeOnSelect: boolean,
|};

export const MenuContext = React.createContext<?Context>(undefined);

export const useMenu = (): Context => {
  const context = React.useContext(MenuContext);
  if (!context) {
    throw new Error(`You can't use the MenuContext outsides a Menu component.`);
  }
  return context;
};
