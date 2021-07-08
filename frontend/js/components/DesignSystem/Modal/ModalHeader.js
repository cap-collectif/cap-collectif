// @flow
import * as React from 'react';
import css from '@styled-system/css';
import Flex from '~ui/Primitives/Layout/Flex';
import Icon from '~ds/Icon/Icon';
import Button from '~ds/Button/Button';
import type { FlexProps } from '~ui/Primitives/Layout/Flex';
import ModalHeaderLabel from './ModalHeaderLabel';
import { useModal } from '~ds/Modal/Modal.context';

type Props = {|
  ...FlexProps,
  +children?: React$Node,
|};

const ModalHeader = ({ children, ...rest }: Props) => {
  const { hide, hideCloseButton } = useModal();
  return (
    <Flex as="header" p={6} pb={0} align="center" {...rest}>
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
        <Button p={0} variantSize="medium" onClick={hide}>
          <Icon name="CROSS" />
        </Button>
      )}
    </Flex>
  );
};

ModalHeader.displayName = 'Modal.Header';
ModalHeader.Label = ModalHeaderLabel;

export default ModalHeader;
