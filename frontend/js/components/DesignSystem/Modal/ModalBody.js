// @flow
import * as React from 'react';
import type { FlexProps } from '~ui/Primitives/Layout/Flex';
import Flex from '~ui/Primitives/Layout/Flex';
import { useModal } from '~ds/Modal/Modal.context';
import useIsMobile from '~/utils/hooks/useIsMobile';

export type Props = {|
  ...FlexProps,
  +children?: React$Node,
|};

const scrollableBody = {
  mt: '50px',
  mb: '84px',
  minHeight: 'calc(100vh - 130px)',
};

const ModalBody = ({ children, ...rest }: Props) => {
  const { fullPageScrollable } = useModal();
  const isMobile = useIsMobile();
  const style = fullPageScrollable && isMobile ? scrollableBody : null;

  return (
    <Flex as="main" p={6} direction="column" {...style} {...rest}>
      {children}
    </Flex>
  );
};

ModalBody.displayName = 'Modal.Body';

export default ModalBody;
