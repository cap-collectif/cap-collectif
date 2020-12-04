// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import { AccordionContext } from '~ds/Accordion/context';
import { AccordionItemContext } from './context';
import AccordionButton from '~ds/Accordion/button';
import AccordionPanel from '~ds/Accordion/panel';

type Props = {|
  children: React.ChildrenArray<
    React.Element<typeof AccordionButton> | React.Element<typeof AccordionPanel>,
  >,
  id: string,
  disabled?: boolean,
|};

const AccordionItem = ({ children, disabled, id, ...props }: Props) => {
  const { updateAccordion, accordion } = React.useContext(AccordionContext);

  const contextValue = React.useMemo(
    () => ({
      open: accordion[id],
      toggleOpen: () => updateAccordion(id),
      disabled,
    }),
    [accordion, id, updateAccordion, disabled],
  );

  return (
    <AccordionItemContext.Provider value={contextValue}>
      <AppBox id={id} bg="white" borderRadius="accordion" {...props}>
        {children}
      </AppBox>
    </AccordionItemContext.Provider>
  );
};

export default AccordionItem;
