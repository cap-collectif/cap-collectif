// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import Icon, { ICON_SIZE } from '~ds/Icon/Icon';

type Props = {|
  ...AppBoxProps,
  +showBackArrow?: boolean,
  +onClose?: () => void,
|};

const DetailDrawerHeader = ({ children, onClose, showBackArrow = true, ...props }: Props) => {
  return (
    <AppBox display="flex" alignItems="center" p={6} {...props}>
      {showBackArrow && (
        <Icon
          onClick={onClose}
          css={{ '&:hover': { cursor: 'pointer' } }}
          color="blue.500"
          size={ICON_SIZE.LG}
          className="detail__drawer--back-arow"
          name="LONG_ARROW_LEFT"
        />
      )}
      {children}
    </AppBox>
  );
};

DetailDrawerHeader.displayName = 'DetailDrawer.Header';

export default DetailDrawerHeader;
