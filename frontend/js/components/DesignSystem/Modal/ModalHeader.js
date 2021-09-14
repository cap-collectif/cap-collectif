// @flow
import * as React from 'react';
import css from '@styled-system/css';
import Flex from '~ui/Primitives/Layout/Flex';
import Icon from '~ds/Icon/Icon';
import Button from '~ds/Button/Button';
import type { FlexProps } from '~ui/Primitives/Layout/Flex';
import ModalHeaderLabel from './ModalHeaderLabel';
import { useModal } from '~ds/Modal/Modal.context';
import useIsMobile from '~/utils/hooks/useIsMobile';

export type Props = {|
  ...FlexProps,
  +children?: React$Node,
  +closeLabel?: string,
|};

const fixedHeader = {
  position: 'fixed',
  top: 0,
  width: '100%',
  zIndex: 1000,
  bg: 'white',
  boxShadow: '0px 0px 10px rgb(0 0 0 / 15%)',
  border: 'none',
  p: 4,
};

const ModalHeader = ({ children, closeLabel, ...rest }: Props) => {
  const { hide, hideCloseButton, fullPageScrollable } = useModal();
  const ref = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.focus();
  }, []);
  const isMobile = useIsMobile();

  const style = fullPageScrollable && isMobile ? fixedHeader : null;
  return (
    <Flex as="header" p={6} pb={0} align="center" {...style} {...rest}>
      <Flex
        direction="column"
        flex={1}
        css={css({
          'h1, h2, h3, h4, h5, h6': {
            color: 'blue.900',
            lineHeight: 'base',
            fontSize: 4,
            fontWeight: 600,
            fontFamily: 'openSans',
          },
        })}>
        {children}
      </Flex>
      {!hideCloseButton && (
        <Button ref={ref} p={0} variantSize="medium" onClick={hide} ariaLabel={closeLabel}>
          <Icon name="CROSS" />
        </Button>
      )}
    </Flex>
  );
};

ModalHeader.displayName = 'Modal.Header';
ModalHeader.Label = ModalHeaderLabel;

export default ModalHeader;
