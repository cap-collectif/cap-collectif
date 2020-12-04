// @flow
import * as React from 'react';

export type Context = {|
  +open: boolean,
  +toggleOpen: () => void,
  +disabled?: boolean,
|};

export const AccordionItemContext = React.createContext<Context>({
  open: false,
  toggleOpen: () => undefined,
  disabled: false,
});
