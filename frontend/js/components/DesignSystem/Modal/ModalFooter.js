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

const fixedFooter = {
  position: 'fixed',
  bottom: 0,
  width: '100%',
  bg: 'white',
  justifyContent: 'center',
  boxShadow: '0px 10px 50px rgb(0 0 0 / 15%)',
  borderRadius: '8px 8px 0px 0px',
  border: 'none',
  p: 4,
  zIndex: 1000,
};

const ModalFooter = ({ children, ...rest }: Props) => {
  const { fullPageScrollable } = useModal();
  const isMobile = useIsMobile();

  const style = fullPageScrollable && isMobile ? fixedFooter : null;

  return (
    <Flex as="footer" p={6} pt={0} align="center" justify="flex-end" {...style} {...rest}>
      {children}
    </Flex>
  );
};

ModalFooter.displayName = 'Modal.Footer';

export default ModalFooter;
