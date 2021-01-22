// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import AccordionItem from './item/index';
import AccordionButton from './button/index';
import AccordionPanel from './panel/index';
import { AccordionContext } from './context';
import type { FlexProps } from '~ui/Primitives/Layout/Flex';

type Props = {|
  ...FlexProps,
  children: React.ChildrenArray<React.Element<typeof AccordionItem>>,
  allowMultiple?: boolean,
  defaultAccordion?: string | string[],
|};

const getDefaultAccordion = (children, defaultAccordion) =>
  React.Children.toArray(children).reduce(
    (acc, child) => ({
      ...acc,
      [child.props.id]: defaultAccordion
        ? Array.isArray(defaultAccordion)
          ? defaultAccordion.includes(child.props.id)
          : defaultAccordion === child.props.id
        : false,
    }),
    {},
  );

const getAccordion = (id, accordion, allowMultiple) =>
  Object.entries(accordion).reduce(
    (acc, [key, value]) => {
      if (!allowMultiple) {
        return {
          ...acc,
          [key]: id !== key ? false : !value,
        };
      }

      return {
        ...acc,
        [key]: id === key ? !value : value,
      };
    },
    { ...accordion },
  );

const Accordion = ({ children, allowMultiple, defaultAccordion, ...props }: Props) => {
  const [accordion, updateAccordion] = React.useState(
    getDefaultAccordion(children, defaultAccordion),
  );

  const contextValue = React.useMemo(
    () => ({
      defaultAccordion,
      allowMultiple,
      accordion,
      updateAccordion: id => updateAccordion(getAccordion(id, accordion, allowMultiple)),
    }),
    [defaultAccordion, allowMultiple, accordion, updateAccordion],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <Flex direction="column" {...props}>
        {children}
      </Flex>
    </AccordionContext.Provider>
  );
};

Accordion.Item = AccordionItem;
Accordion.Button = AccordionButton;
Accordion.Panel = AccordionPanel;

export default Accordion;
