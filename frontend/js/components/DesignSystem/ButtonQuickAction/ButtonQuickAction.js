// @flow
import * as React from 'react';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import S from './ButtonQuickAction.style';
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon';
import Button from '~ds/Button/Button';
import Tooltip from '~ds/Tooltip/Tooltip';

type Props = {|
  ...AppBoxProps,
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | string,
  variantColor: 'primary' | 'danger' | 'green',
  icon: $Values<typeof ICON_NAME>,
  label: React.Node,
  iconColor?: string,
|};

const PADDING = {
  [ICON_SIZE.XS]: 1,
  [ICON_SIZE.SM]: 1,
  [ICON_SIZE.MD]: 1,
  [ICON_SIZE.LG]: 2,
  [ICON_SIZE.XL]: 2,
  [ICON_SIZE.XXL]: 3,
};

const ButtonQuickAction = React.forwardRef<Props, HTMLElement>(
  ({ variantColor, icon, label, iconColor, size = ICON_SIZE.MD, ...props }: Props, ref) => {
    return (
      <Tooltip label={label}>
        <Button
          ref={ref}
          borderRadius="buttonQuickAction"
          css={S[variantColor]}
          p={PADDING[size]}
          {...props}>
          <Icon name={icon} size={size} color={iconColor || 'gray.500'} />
        </Button>
      </Tooltip>
    );
  },
);

ButtonQuickAction.displayName = 'ButtonQuickAction';

export default ButtonQuickAction;
