// @flow
import * as React from 'react';
import type { FlexProps } from '~ui/Primitives/Layout/Flex';
import Flex from '~ui/Primitives/Layout/Flex';

type Props = {|
  ...FlexProps,
  +children?: React$Node,
|};

const ModalBody = ({ children, ...rest }: Props) => {
  return (
    <Flex as="main" p={6} direction="column" {...rest}>
      {children}
    </Flex>
  );
};

ModalBody.displayName = 'Modal.Body';

export default ModalBody;
