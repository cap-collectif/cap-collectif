// @flow
import * as React from 'react';

export type Context = {|
  preloadReply: (replyId: string, skipPreload?: boolean) => void,
|};

export const QuestionnaireStepPageContext = React.createContext<Context>({
  preloadReply: () => undefined,
});
