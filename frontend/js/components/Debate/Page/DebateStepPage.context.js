// @flow
import * as React from 'react';

export type Context = {|
  +title: string,
  +stepClosed: boolean,
  +widget: {|
    +isSource: boolean,
    +authEnabled: boolean,
    +location: ?string,
  |},
|};

export const DebateStepPageContext = React.createContext<Context>({
  title: '',
  stepClosed: true,
  widget: {
    isSource: false,
    authEnabled: false,
    location: null,
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
