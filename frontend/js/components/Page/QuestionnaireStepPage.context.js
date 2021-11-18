// @flow
import * as React from 'react';

export type Context = {|
  preloadReply: (replyId: string, skipPreload?: boolean) => void,
  anonymousRepliesIds: Array<string>,
|};

export const QuestionnaireStepPageContext = React.createContext<Context>({
  preloadReply: () => undefined,
  anonymousRepliesIds: [],
});
