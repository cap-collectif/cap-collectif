// @flow
import * as React from 'react';

export type Context = {|
  +value?: string | null,
  +onChange?: (value: string) => void,
|};

export const DropdownSelectContext = React.createContext<Context>({
  value: null,
});
