// @flow
import * as React from 'react';

export type Context = {|
  +value?: string | null,
  +onChange?: (value: string) => void,
|};

export const InlineSelectContext = React.createContext<Context>({
  value: null,
});
