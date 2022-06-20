// @flow
import * as React from 'react';

export type Context = {|
  +stepClosed: boolean,
  +widget: {|
    +isSource: boolean,
    +location: ?string,
  |},
|};

export const DebateStepPageContext: React.Context<Context> = React.createContext<Context>({
  stepClosed: true,
  widget: {
    isSource: false,
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
