// @flow
import * as React from 'react';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import S from './ButtonQuickAction.style';
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon';
import Button from '~ds/Button/Button';
import Tooltip from '~ds/Tooltip/Tooltip';

type Props = {|
  ...AppBoxProps,
  variantColor: 'primary' | 'danger' | 'green',
  icon: $Values<typeof ICON_NAME>,
  label: React.Node,
  iconColor?: string,
|};

const ButtonQuickAction = React.forwardRef<Props, HTMLElement>(
  ({ variantColor, icon, label, iconColor, ...props }: Props, ref) => {
    return (
      <Tooltip label={label}>
        <Button ref={ref} p={1} borderRadius="buttonQuickAction" css={S[variantColor]} {...props}>
          <Icon name={icon} size={ICON_SIZE.MD} color={iconColor || 'gray.500'} />
        </Button>
      </Tooltip>
    );
  },
);

ButtonQuickAction.displayName = 'ButtonQuickAction';

export default ButtonQuickAction;
