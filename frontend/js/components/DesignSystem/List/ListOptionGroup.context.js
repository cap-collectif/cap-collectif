// @flow
import * as React from 'react';

export type Context = {|
  +value?: string | string[],
  +onChange?: (newValue: string | string[]) => void,
  +type: 'checkbox' | 'radio',
|};

export const ListOptionGroupContext = React.createContext<Context>({
  type: 'checkbox',
});

export const useListOptionGroup = (): Context => {
  const context = React.useContext(ListOptionGroupContext);
  if (!context) {
    throw new Error(
      `You can't use the ListOptionGroupContext outsides a ListOptionGroup component.`,
    );
  }
  return context;
};
