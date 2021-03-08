// @flow
import * as React from 'react';

export type Context = {|
  +title: string,
  +widget: {|
    +isSource: boolean,
    +authEnabled: boolean,
  |},
|};

export const DebateStepPageContext = React.createContext<Context>({
  title: '',
  widget: {
    isSource: false,
    authEnabled: false,
  },
});

export const useDebateStepPage = (): Context => {
  const context = React.useContext(DebateStepPageContext);
  if (!context) {
    throw new Error(
      `You can't use the DebateStepPageContext outsides a DebateStepPage.Provider component.`,
    );
  }
  return context;
};
