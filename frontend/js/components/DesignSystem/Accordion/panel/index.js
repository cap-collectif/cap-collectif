// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import { AccordionItemContext } from '~ds/Accordion/item/context';

type Props = {|
  children: React.Node,
|};

const AccordionPanel = ({ children, ...props }: Props) => {
  const { open } = React.useContext(AccordionItemContext);

  return open ? (
    <Flex direction="column" px={9} pb={8} {...props}>
      {children}
    </Flex>
  ) : null;
};

export default AccordionPanel;
