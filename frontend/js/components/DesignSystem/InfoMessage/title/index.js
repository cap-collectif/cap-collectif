// @flow
import * as React from 'react';
import cn from 'classnames';
import Flex, { type FlexProps } from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import Icon, { ICON_NAME } from '~ds/Icon/Icon';
import { FontWeight } from '~ui/Primitives/constants';

export const INFO_MESSAGE_TITLE_NAME: 'InfoMessage.Title' = 'InfoMessage.Title';

type Variant = 'info' | 'infoGray' | 'danger' | 'success' | 'warning';
type VariantIcon = {|
  [key: Variant]: {|
    name: $Values<typeof ICON_NAME>,
    color: string,
  |},
|};

type InfoMessageTitleProps = {|
  ...FlexProps,
  +children: string,
  +variant?: Variant,
  +withIcon?: boolean,
|};

const getIcon = (variant: Variant) => {
  const variantIcon: VariantIcon = {
    info: {
      name: ICON_NAME.CIRCLE_INFO,
      color: 'blue.500',
    },
    infoGray: {
      name: ICON_NAME.CIRCLE_INFO,
      color: 'gray.500',
    },
    danger: {
      name: ICON_NAME.CIRCLE_CROSS,
      color: 'red.500',
    },
    success: {
      name: ICON_NAME.CIRCLE_CHECK,
      color: 'green.500',
    },
    warning: {
      name: ICON_NAME.CIRCLE_ALERT,
      color: 'orange.500',
    },
  };

  return <Icon {...variantIcon[variant]} size="sm" />;
};

const getColor = (variant?: Variant): string => {
  switch (variant) {
    case 'info':
      return 'blue.900';
    case 'infoGray':
      return 'gray.900';
    case 'danger':
      return 'red.900';
    case 'success':
      return 'green.900';
    case 'warning':
      return 'orange.900';
    default:
      throw Error;
  }
};

const InfoMessageTitle = ({
  children,
  className,
  variant,
  withIcon,
  ...props
}: InfoMessageTitleProps) => (
  <Flex
    direction="row"
    spacing={2}
    className={cn('info-message-title', className)}
    align="center"
    {...props}>
    {withIcon && variant && getIcon(variant)}
    <Text color={getColor(variant)} fontSize={1} fontWeight={FontWeight.Semibold} lineHeight="sm">
      {children}
    </Text>
  </Flex>
);

InfoMessageTitle.displayName = INFO_MESSAGE_TITLE_NAME;

export default InfoMessageTitle;
