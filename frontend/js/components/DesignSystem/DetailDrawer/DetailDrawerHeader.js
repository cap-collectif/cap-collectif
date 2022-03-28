// @flow
import * as React from 'react';
import {Flex, Icon, CapUIIcon, CapUIIconSize} from '@cap-collectif/ui';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

type Props = {|
  ...AppBoxProps,
  +showBackArrow?: boolean,
  +onClose?: () => void,
|};

const DetailDrawerHeader = ({ children, onClose, showBackArrow = true, ...props }: Props) => {
  return (
    <Flex align="center" p={6} {...props}>
      {showBackArrow && (
        <Icon
          onClick={onClose}
          css={{ '&:hover': { cursor: 'pointer' } }}
          color="blue.500"
          size={CapUIIconSize.Lg}
          className="detail__drawer--back-arow"
          name={CapUIIcon.LongArrowLeft}
        />
      )}
      {children}
    </Flex>
  );
};

DetailDrawerHeader.displayName = 'DetailDrawer.Header';

export default DetailDrawerHeader;
