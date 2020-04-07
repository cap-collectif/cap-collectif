// @flow
import * as React from 'react';

export type Context = {|
  +isMultiSelect: boolean,
  +value?: string | string[] | null,
  +onChange?: (value: string | string[]) => void | Promise<any>,
|};

export const DropdownSelectContext = React.createContext<Context>({
  value: null,
  isMultiSelect: false,
});
