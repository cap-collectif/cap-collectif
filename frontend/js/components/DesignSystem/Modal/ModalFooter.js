// @flow
import * as React from 'react';
import type { FlexProps } from '~ui/Primitives/Layout/Flex';
import Flex from '~ui/Primitives/Layout/Flex';

type Props = {|
  ...FlexProps,
  +children?: React$Node,
|};

const ModalFooter = ({ children, ...rest }: Props) => {
  return (
    <Flex as="footer" p={6} pt={0} align="center" justify="flex-end" {...rest}>
      {children}
    </Flex>
  );
};

ModalFooter.displayName = 'Modal.Footer';

export default ModalFooter;
