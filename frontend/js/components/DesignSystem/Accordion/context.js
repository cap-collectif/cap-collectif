// @flow
import * as React from 'react';

type Accordion = {|
  [string]: boolean,
|};

export type Context = {|
  defaultAccordion?: string | string[],
  allowMultiple?: boolean,
  accordion: Accordion,
  updateAccordion: (id: string) => void,
|};

export const AccordionContext = React.createContext<Context>({
  defaultAccordion: '',
  allowMultiple: false,
  accordion: {},
  updateAccordion: () => undefined,
});
