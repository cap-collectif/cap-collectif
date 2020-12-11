// @flow
import * as React from 'react';

export type Context = {|
  +value?: string | string[],
  +onChange?: (newValue: string | string[]) => void,
  +type: 'checkbox' | 'radio',
|};

export const MenuOptionGroupContext = React.createContext<Context>({
  type: 'checkbox',
});

export const useMenuOptionGroup = (): Context => {
  const context = React.useContext(MenuOptionGroupContext);
  if (!context) {
    throw new Error(
      `You can't use the MenuOptionGroupContext outsides a MenuOptionGroup component.`,
    );
  }
  return context;
};
