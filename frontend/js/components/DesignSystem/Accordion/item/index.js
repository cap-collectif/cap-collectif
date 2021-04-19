// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import { AccordionContext } from '~ds/Accordion/context';
import { AccordionItemContext } from './context';
import AccordionButton from '~ds/Accordion/button';
import AccordionPanel from '~ds/Accordion/panel';
import SidebarButton from '~/components/Admin/Sidebar/SidebarButton';

type Props = {|
  ...AppBoxProps,
  children: React.ChildrenArray<
    | React.Element<typeof AccordionButton>
    | React.Element<typeof AccordionPanel>
    | React.Element<typeof SidebarButton>,
  >,
  id: string,
  disabled?: boolean,
|};

const AccordionItem = ({ children, disabled, id, ...props }: Props) => {
  const { updateAccordion, accordion } = React.useContext(AccordionContext);
  const isOpen = accordion[id];

  const contextValue = React.useMemo(
    () => ({
      open: isOpen,
      toggleOpen: () => updateAccordion(id),
      disabled,
    }),
    [isOpen, id, updateAccordion, disabled],
  );

  return (
    <AccordionItemContext.Provider value={contextValue}>
      <AppBox id={id} bg="white" borderRadius="accordion" pb={isOpen ? 8 : 0} {...props}>
        {children}
      </AppBox>
    </AccordionItemContext.Provider>
  );
};

export default AccordionItem;
